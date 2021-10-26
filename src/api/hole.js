import cloneDeep from 'lodash.clonedeep';
import marked from 'marked';
export class NativeFloor {
}
export class WrappedHole {
    constructor(hole) {
        this.hole = hole;
        this.styleData = {
            fold: true,
            lines: 3
        };
        this.floors = cloneDeep(hole.floors.prefetch);
        this.firstFloor = cloneDeep(hole.floors.firstFloor);
        this.lastFloor = cloneDeep(hole.floors.lastFloor);
        this.firstFloor.content = marked(this.firstFloor.content);
        this.lastFloor.content = marked(this.lastFloor.content);
        this.isFolded = this.firstFloor.fold.length > 0;
    }
}
//# sourceMappingURL=hole.js.map