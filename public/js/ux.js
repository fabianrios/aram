 CKEDITOR.replace( 'fulltext' );
 
 (function() {
     document.getElementById("image_upload").onchange = function(){
         var files = document.getElementById("image_upload").files;
         var file = files[0];
         if(file == null){
             console.log("No file selected.");
         }
         else{
             get_signed_request(file);
         }
     };
     
     function get_croped(url,file){
       var xhr = new XMLHttpRequest();
       xhr.open("GET", "/crop?url="+url+"&file_name="+file.name+"&file_type="+file.type);
       xhr.onreadystatechange = function(){
           if(xhr.readyState === 4){
               if(xhr.status === 200){
                   var response = JSON.parse(xhr.responseText);
                   console.log(response);
                   // upload_file(response.file, response.signed_request, response.url,false);
               }
               else{
                   console.log("Wasn't a good crop.");
               }
           }
       };
       xhr.send();
     }
     
     function get_signed_request(file){
         var xhr = new XMLHttpRequest();
         xhr.open("GET", "/sign_s3?file_name="+file.name+"&file_type="+file.type);
         xhr.onreadystatechange = function(){
             if(xhr.readyState === 4){
                 if(xhr.status === 200){
                     var response = JSON.parse(xhr.responseText);
                     upload_file(file, response.signed_request, response.url,true);
                 }
                 else{
                     console.log("Could not get signed URL.");
                 }
             }
         };
         xhr.send();
     }
     
     var images = {
       original: "",
       small: ""
     };
     function upload_file(file, signed_request, url,first){
        console.log(first,file);
        if (first){
          var xhr = new XMLHttpRequest();
          xhr.open("PUT", signed_request);
          xhr.setRequestHeader('x-amz-acl', 'public-read');
          xhr.onload = function() {
              if (xhr.status === 200) {
                  // let's crop them
                  get_croped(url,file);
                  images.original = url;
              }
          };
          xhr.onerror = function() {
              alert("Could not upload file.");
          };
          xhr.send(file);
          
        }else{
          
          var xhr = new XMLHttpRequest();
          xhr.open("PUT", signed_request);
          xhr.setRequestHeader('x-amz-acl', 'public-read');
          xhr.onload = function() {
              if (xhr.status === 200) {
                   images.small = url;
                   document.getElementById("preview").src = url;
                   document.getElementById("image_url").value = JSON.stringify(images);
                   console.log(JSON.stringify(images));
                 }
          };
          xhr.onerror = function() {
              alert("Could not upload file.");
          };
          xhr.send(file);
          
        }
        
     }
     
 })();
 
 