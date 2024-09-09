export class ManagePropertiesJson{
    initWithJSON(json){
        for (var key in json) {
            this[key] = json[key];
        }
    }
    getOwnPropertyNames(): string[]{
        let r=Object.getOwnPropertyNames(this);
        return r
    }
}