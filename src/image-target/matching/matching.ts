import TinyQueue from 'tinyqueue';
import { compute as hammingCompute } from './hamming-distance';
import { computeHoughMatches } from './hough';
import { computeHomography } from './ransacHomography';
import { Geometry } from '../utils';
import {
  CLUSTER_MAX_POP,
  HAMMING_THRESHOLD,
  INLIER_THRESHOLD,
  MIN_NUM_INLIERS,
} from '../utils/constant/matching';
import { IDebugExtra, IMatches } from '../utils/types/detector';
import { IKeyFrame, IMaximaMinimaPoint } from '../utils/types/compiler';
import { INode, INodeQueue } from '../utils/types/matching';
import { Helper } from '../../libs';

const { multiplyPointHomographyInhomogenous, matrixInverse33 } = Geometry;

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

// match list of querpoints against pre-built list of keyframes
const match = ({
  keyframe,
  querypoints,
  querywidth,
  queryheight,
  debugMode,
}: {
  keyframe: IKeyFrame;
  querypoints: IMaximaMinimaPoint[];
  querywidth: number;
  queryheight: number;
  debugMode: boolean;
}) => {
  const debugExtra: IDebugExtra = {} as IDebugExtra;

  const matches = [];

  for (let j = 0; j < querypoints.length; j++) {
    const querypoint = querypoints[j];
    const keypoints = querypoint.maxima ? keyframe.maximaPoints : keyframe.minimaPoints;

    if (keypoints.length === 0) continue;

    const rootNode = querypoint.maxima
      ? keyframe.maximaPointsCluster.rootNode
      : keyframe.minimaPointsCluster.rootNode;

    const keypointIndexes: number[] = [];

    const queue = new TinyQueue([], (a1: INodeQueue, a2: INodeQueue) => a1.d - a2.d);

    // query all potential keypoints
    _query({ node: rootNode, keypoints, querypoint, queue, keypointIndexes, numPop: 0 });

    let bestIndex = -1;
    let bestD1 = MAX_SAFE_INTEGER;
    let bestD2 = MAX_SAFE_INTEGER;

    for (let k = 0; k < keypointIndexes.length; k++) {
      const keypoint = keypoints[keypointIndexes[k]];

      const d = hammingCompute({ v1: keypoint.descriptors, v2: querypoint.descriptors });

      if (d < bestD1) {
        bestD2 = bestD1;
        bestD1 = d;
        bestIndex = k;
      } else if (d < bestD2) {
        bestD2 = d;
      }
    }

    if (
      bestIndex !== -1 &&
      (bestD2 === MAX_SAFE_INTEGER || (1.0 * bestD1) / bestD2 < HAMMING_THRESHOLD)
    )
      matches.push({ querypoint, keypoint: keypoints[bestIndex] });
  }

  if (debugMode) debugExtra.matches = matches;

  if (matches.length < MIN_NUM_INLIERS) return { debugExtra };

  const houghMatches = computeHoughMatches({
    keywidth: keyframe.width,
    keyheight: keyframe.height,
    querywidth,
    queryheight,
    matches,
  });

  if (debugMode) debugExtra.houghMatches = houghMatches;

  const H = computeHomography({
    srcPoints: houghMatches.map((m) => [m.keypoint.x, m.keypoint.y]) as number[][],
    dstPoints: houghMatches.map((m) => [m.querypoint.x, m.querypoint.y]) as number[][],
    keyframe,
  });

  if (!H) return { debugExtra };

  const inlierMatches = _findInlierMatches({
    H,
    matches: houghMatches,
    threshold: INLIER_THRESHOLD,
  });

  if (debugMode) debugExtra.inlierMatches = inlierMatches;

  if (inlierMatches.length < MIN_NUM_INLIERS) return { debugExtra };

  // do another loop of match using the homography
  const HInv = matrixInverse33(H, 0.00001);

  if (!HInv) return { debugExtra };

  const dThreshold2 = 10 ** 2;
  const matches2 = [];

  for (let j = 0; j < querypoints.length; j++) {
    const querypoint = querypoints[j];
    const mapquerypoint = multiplyPointHomographyInhomogenous([querypoint.x, querypoint.y], HInv);

    let bestIndex = -1;
    let bestD1 = MAX_SAFE_INTEGER;
    let bestD2 = MAX_SAFE_INTEGER;

    const keypoints = querypoint.maxima ? keyframe.maximaPoints : keyframe.minimaPoints;

    for (let k = 0; k < keypoints.length; k++) {
      const keypoint = keypoints[k];

      // check distance threshold
      const d2 =
        (keypoint.x - mapquerypoint[0]) * (keypoint.x - mapquerypoint[0]) +
        (keypoint.y - mapquerypoint[1]) * (keypoint.y - mapquerypoint[1]);
      if (d2 > dThreshold2) continue;

      const d = hammingCompute({ v1: keypoint.descriptors, v2: querypoint.descriptors });

      if (d < bestD1) {
        bestD2 = bestD1;
        bestD1 = d;
        bestIndex = k;
      } else if (d < bestD2) {
        bestD2 = d;
      }
    }

    if (
      bestIndex !== -1 &&
      (bestD2 === MAX_SAFE_INTEGER || (1.0 * bestD1) / bestD2 < HAMMING_THRESHOLD)
    ) {
      matches2.push({ querypoint, keypoint: keypoints[bestIndex] });
    }
  }

  if (debugMode) debugExtra.matches2 = matches2;

  const houghMatches2 = computeHoughMatches({
    keywidth: keyframe.width,
    keyheight: keyframe.height,
    querywidth,
    queryheight,
    matches: matches2,
  });

  if (debugMode) debugExtra.houghMatches2 = houghMatches2;

  const H2 = computeHomography({
    srcPoints: houghMatches2.map((m) => [m.keypoint.x, m.keypoint.y]),
    dstPoints: houghMatches2.map((m) => [m.querypoint.x, m.querypoint.y]),
    keyframe,
  });

  if (!H2) return { debugExtra };

  const inlierMatches2 = _findInlierMatches({
    H: H2,
    matches: houghMatches2,
    threshold: INLIER_THRESHOLD,
  });

  if (debugMode) debugExtra.inlierMatches2 = inlierMatches2;

  return { H: H2, matches: inlierMatches2, debugExtra };
};

const _query = ({
  node,
  keypoints,
  querypoint,
  queue,
  keypointIndexes,
  numPop,
}: {
  node: INode;
  keypoints: IMaximaMinimaPoint[];
  querypoint: IMaximaMinimaPoint;
  queue: TinyQueue<INodeQueue>;
  keypointIndexes: number[];
  numPop: number;
}) => {
  if (node.leaf) {
    for (let i = 0; i < node.pointIndexes.length; i++) {
      keypointIndexes.push(node.pointIndexes[i]);
    }

    return;
  }

  const distances: number[] = [];

  for (let i = 0; i < node.children.length; i++) {
    const childNode = node.children[i];
    const centerPointIndex = childNode.centerPointIndex;

    if (Helper.isNil(centerPointIndex)) continue;

    const d = hammingCompute({
      v1: keypoints[centerPointIndex].descriptors,
      v2: querypoint.descriptors,
    });

    distances.push(d);
  }

  let minD = MAX_SAFE_INTEGER;
  for (let i = 0; i < node.children.length; i++) {
    minD = Math.min(minD, distances[i]);
  }

  for (let i = 0; i < node.children.length; i++) {
    if (distances[i] !== minD) {
      queue.push({ node: node.children[i], d: distances[i] });
    }
  }

  for (let i = 0; i < node.children.length; i++) {
    if (distances[i] === minD) {
      _query({ node: node.children[i], keypoints, querypoint, queue, keypointIndexes, numPop });
    }
  }

  if (numPop < CLUSTER_MAX_POP && queue.length > 0) {
    const popResult = queue.pop();

    if (popResult) {
      const { node } = popResult as INodeQueue;
      numPop += 1;

      _query({ node, keypoints, querypoint, queue, keypointIndexes, numPop });
    }
  }
};

const _findInlierMatches = (options: { H: number[]; matches: IMatches[]; threshold: number }) => {
  const { H, matches, threshold } = options;

  const threshold2 = threshold ** 2;

  const goodMatches: IMatches[] = [];

  for (let i = 0; i < matches.length; i++) {
    const { querypoint, keypoint } = matches[i];

    const mp = multiplyPointHomographyInhomogenous([keypoint.x, keypoint.y], H);
    const d2 =
      (mp[0] - querypoint.x) * (mp[0] - querypoint.x) +
      (mp[1] - querypoint.y) * (mp[1] - querypoint.y);

    if (d2 <= threshold2) goodMatches.push(matches[i]);
  }

  return goodMatches;
};

export { match };
