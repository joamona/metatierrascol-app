import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-field-image',
  templateUrl: './field-image.component.html',
  styleUrls: ['./field-image.component.scss'],
  standalone: true
})
export class FieldImageComponent  implements OnInit {
  imageSrc="";

  constructor() { }

  ngOnInit() {
    Camera.requestPermissions();
  }

  async takeImage(){

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
  
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = image.webPath;
    console.log(imageUrl)
  
    // Can be set to the src of an image now
    this.imageSrc = imageUrl!;
  };
}

