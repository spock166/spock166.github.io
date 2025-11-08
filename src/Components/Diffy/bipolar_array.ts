export class BipolarArray {
    data:any[];
    constructor(data: any[]) {
        this.data = data;
    }

    get(index: number): any {
        if (index < 0) {
            index = this.data.length + index;
        }
        return this.data[index];
    }

    set(index: number, value: any): void {
        if (index < 0) {
            index = this.data.length + index;
        }
        this.data[index] = value;
    }
}