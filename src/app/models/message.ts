import { getTime } from '../utilities/general';

export class Message {
    public ok: boolean;
    public message: string;
    public class: string;
    public state: string;
    public time: string;
   
    constructor(ok:string, message: string) {
      this.message = message;
      this.time = getTime();
      if (ok=='info'){
        this.ok=true;
        this.state="Info";
        this.class="alert alert-info";
      } else {
        if (ok=="true"){
            this.ok=true;
            this.state="Success";
            this.class="alert alert-success";
        } else {
          this.ok=false;
          this.state="Danger";
          this.class="alert alert-danger";
        }
    }
  }
}