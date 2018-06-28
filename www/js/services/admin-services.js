angular.module('admin.services', [])
.service("uploadService", function($q, $parse) {
    var database = firebase.database();
    var adminRef = database.ref('userData/admin');
    var result ={key: "", heading: "", text:""};
    var dataSet=[];
    var completeDataSet=[];
    var deferred = $q.defer();
    var storageRef = firebase.storage().ref(); // reference for PDF upload
    var pdfRef = storageRef.child('pdf/main.pdf');

    this.getPDF= function(){
      var deferred = $q.defer();
      var storageRef = firebase.storage().ref();
      // Get the download URL
      pdfRef.getDownloadURL().then(function(url) {
          deferred.resolve(url);
        // Insert url into an <img> tag to "download"
      }).catch(function(error) {
        deferred.reject(error);
      });
     return deferred.promise;
    }

    this.savePDF= function(file){
      pdfRef.put(file).then(function(snapshot) {
      });
    }

    this.deletePDF= function(){
      var deleteRef = storageRef.child('pdf/main.pdf');
      pdfRef.delete().then(function(snapshot) {
      });
    }



    this.saveData= function(file){
      if(!file.heading)
      {
        file.heading = "";
      }
      if(!file.text)
      {
        file.text = "";
      }
      if(file.timestamp.length)
      {
        adminRef.child(file.timestamp).update({
              timestamp: file.timestamp,
              heading:file.heading,
              text: file.text,
              file: file.fileUpload,
              fileType: file.fileType,
              fileName: file.fileName
        });
        return true;
      }
      else{
        var time = Date.now();
        adminRef.child(time).set({
          timestamp: time,
          heading:file.heading,
          text: file.text,
          file: file.fileUpload,
          fileType: file.fileType,
          fileName: file.fileName
        });
            return true
      }
    }


    this.retrieveData= function(){
      var freeFormDataSet = [];
      var deferred = $q.defer();
      adminRef.on('value', function(snapshot){
        if(snapshot.val() !=null)
        {
          var uploadedData = snapshot.val();
          var keys = Object.keys(uploadedData)
          for(var i=0; i< keys.length; i++)
          {
              var k = keys[i];
              freeFormDataSet.push(uploadedData[k]);
          }
            dataSet = freeFormDataSet;
            deferred.resolve(freeFormDataSet)
        }

        else{
          deferred.resolve(null)
        }
    });
     return deferred.promise;
  };

  this.getfreeFormData =  function(){
      return dataSet;
  }

  this.keyBasedSearch = function(key){
    var freeFormDataSet = [];
    var ref = database.ref('userData/admin/' + key);
    var deferred = $q.defer();
    ref.once('value', function(snapshot){
      if(snapshot.val() !=null)
      {
        var result = snapshot.val();
      }
          deferred.resolve(result)
    });
   return deferred.promise;
  };


  this.delete = function(key){
    var deferred = $q.defer();
    var userRef = database.ref('userData/admin/' + key);
    deferred.resolve();
    userRef.remove();
    return deferred.promise;
  }

  this.userResults = function(level, group){
      var deferred = $q.defer();
      var userResults = [];
      var total= 0;
      var count= 0;
      var successP= 0;
      var userRef = database.ref('userData/account');
      userRef.once('value', function(snapshot){
        var userProfile = snapshot.val();
        var keys = Object.keys(userProfile);
        for(var i=0; i< keys.length; i++)
        {
            var k = keys[i];
            if(userProfile[k].group == group && userProfile[k].level == level)
            {
              count++;
              total+= parseInt(userProfile[k].resultPercentage);
            }
        }
        successP = total/count;
        deferred.resolve(successP);
      });
      return deferred.promise;
  }

})
