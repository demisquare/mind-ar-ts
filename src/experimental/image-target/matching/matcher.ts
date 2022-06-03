import match from './matching';
import { IKeyFrame, IMaximaMinimaPoint } from '../../../image-target/utils/types/compiler';
import { IDebugExtra } from '../../../image-target/utils/types/detector';

class Matcher {
  private queryWidth: number;
  private queryHeight: number;
  private debugMode: boolean;

  constructor(queryWidth: number, queryHeight: number, debugMode = false) {
    this.queryWidth = queryWidth;
    this.queryHeight = queryHeight;
    this.debugMode = debugMode;
  }

  matchDetection(keyframes: IKeyFrame[], featurePoints: IMaximaMinimaPoint[]) {
    const debugExtra: { frames: IDebugExtra[] } = { frames: [] };

    let bestResult: {
      keyframeIndex: number;
      matches: ReturnType<typeof match>['matches'];
      H: number[];
    } | null = null;

    for (let i = 0; i < keyframes.length; i++) {
      const matchResult = match({
        keyframe: keyframes[i],
        querypoints: featurePoints,
        querywidth: this.queryWidth,
        queryheight: this.queryHeight,
        debugMode: this.debugMode,
      });

      if (!matchResult) continue;

      const { H, matches, debugExtra: frameDebugExtra } = matchResult;

      debugExtra.frames.push(frameDebugExtra);

      if (H && (bestResult === null || (bestResult?.matches?.length ?? 0 < matches.length))) {
        bestResult = {
          keyframeIndex: i,
          matches,
          H,
        };
      }
    }

    if (bestResult === null || !bestResult.matches)
      return {
        keyframeIndex: -1,
        debugExtra,
      };

    const screenCoords: Vector2[] = [];
    const worldCoords: Vector3[] = [];
    const keyframe = keyframes[bestResult.keyframeIndex];

    for (let i = 0; i < bestResult.matches.length; i++) {
      const querypoint = bestResult.matches[i].querypoint;
      const keypoint = bestResult.matches[i].keypoint;

      screenCoords.push({
        x: querypoint.x,
        y: querypoint.y,
      });

      worldCoords.push({
        x: (keypoint.x + 0.5) / keyframe.scale,
        y: (keypoint.y + 0.5) / keyframe.scale,
        z: 0,
      });
    }

    return {
      keyframeIndex: bestResult.keyframeIndex,
      screenCoords,
      worldCoords,
      debugExtra,
    };
  }
}

export default Matcher;
