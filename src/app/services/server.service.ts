import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageService } from './message.service';
import { Message } from '../models/message';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ServerService {

   constructor(private httpClient : HttpClient, private messageService: MessageService, 
               private authService: AuthService) {
      //carga la url del local storage
      //en app.component.ts
   }

   get(viewName:String): Observable<any>{
     //console.log('getting ' + this.authService.urlDjangoApi + viewName);
     var message=new Message('info','Getting data from ' + viewName);
     this.messageService.add(message)
     return this.httpClient.get(this.authService.urlDjangoApi + viewName);
   }
   /**
   * This function receives a object, not a json
   * The object is the form data {"field":"value", ...}
   * The content-type is set to application/json, so in django this data appears not in request.POST
   * The object is sent in the form_data key of the dictionary.
   * 
   * but in request.body. This is not suitable to send files
   * 
   * sendAutorizationToken:boolean=true --> Normalmente hay que enviarlo,
   *  menos para el login, que no hay que hacerlo 
   */
   post(viewName:String, postData?: Object, sendAutorizationToken:boolean=true): Observable<any>{
      var headers: HttpHeaders;
      if (sendAutorizationToken){
         headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Token ' + this.authService.token});
      }else{
         headers = new HttpHeaders({ 'Content-Type': 'application/json'});
      }
      var message=new Message('info','Sending POST data to ' + viewName + '. Data: ' + JSON.stringify(postData));
      this.messageService.add(message);
      
      return this.httpClient.post(
            this.authService.urlDjangoApi + viewName, postData,
            {headers: headers, responseType : 'json', reportProgress: false}
         );
   }

   postDownloadFile(viewName:String, postData?: Object): Observable<any>{
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Token ' + this.authService.token  });
      var message=new Message('info','Sending data to ' + viewName);
      this.messageService.add(message);
      return this.httpClient.post(this.authService.urlDjangoApi + viewName, {postData},
         {headers: headers, responseType : 'blob', reportProgress: false} );
   }

   postDownloadFileWithProgress(viewName:String, postData?: Object): Observable<any>{

      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Token ' + this.authService.token  });
      var message=new Message('info','Sending data to ' + viewName);
      this.messageService.add(message);
      return this.httpClient.post(this.authService.urlDjangoApi + viewName, {postData},
         {headers: headers, responseType : 'blob', reportProgress: true, observe: 'events'});
   }

   /**
   * This function receives a object a FormData object: const formData = new FormData();
   * The object is sent in the form_data key of the dictionary.
   * The content-type is empty, so the content is set to the default multipart/form-data.
   * In django this data appears in request.POST
   * This method allows send files to django
   */
   postForm(viewName:String, postData?: Object): Observable<any>{
      const headers = new HttpHeaders({'Authorization': 'Token ' + this.authService.token });
      var message=new Message('info','Sending post data to ' + viewName);
      this.messageService.add(message);
      return this.httpClient.post(this.authService.urlDjangoApi + viewName, {postData}, {headers: headers, responseType : 'json', reportProgress: false});
   } 
   upload(viewName:String, data: FormData) {
      let headers = new HttpHeaders({'Authorization': 'Token ' + this.authService.token });
      let uploadURL = this.authService.urlDjangoApi + viewName;
      var message=new Message('info','Sending the file to ' + viewName);
      this.messageService.add(message);
      return this.httpClient.post<any>(uploadURL, data, {headers: headers, responseType : 'json', reportProgress: true, observe: 'events'});
    }
}

