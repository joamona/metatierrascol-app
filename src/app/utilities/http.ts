import {HttpParams} from "@angular/common/http";

/**
 * Receives a js object and return a HttpParams object.
 * You can use this objejct in a get or post http request
 *  return this.httpClient.get(url,{params:httpParams});
 */
export function objectToHttpParams(obj: Object):HttpParams{
    var httpParams: HttpParams;
    httpParams = new HttpParams();
    
    for (let property in obj) {
      //pay attention in I overwrite httpParams
      httpParams=httpParams.append(property,String(obj[property]));
    }
    return httpParams;
  }