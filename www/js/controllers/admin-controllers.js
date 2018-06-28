angular.module('admin.controllers', [])
//FileUploadCtrl.$inject = ['$$scope']
.controller('adminSummaryCtrl', function($scope, $state, uploadService, $firebaseArray, $ionicPopup, $sce, $window, $cordovaFileTransfer) {
    $scope.flag = false;
    $scope.pdfDetails= {pdfUpload: "", fileType: "", pdfName: ""};
    var _validFileExtensions = [".pdf"];
    $scope.title = [];
    $scope.title = uploadService.getfreeFormData();

    uploadService.getPDF().then(function(url){
        $scope.flag= true;
        $scope.pdf= url;
    }),
      function(error){
        console.log(error);
      }

    var dlnk = document.getElementById('dwnldLnk');
    $scope.download = function(){
        uploadService.getPDF().then(function(url){
           $scope.flag= true;
           $scope.pdf= url;
           dlnk.href = $scope.pdf;
           document.body.appendChild(dlnk);
           dlnk.click();
           document.body.removeChild(dlnk);
           dlnk.click();
           $scope.flag = true;
         });
    }

    $scope.deviceDownload = function(){
      _fileTransfer = new FileTransfer();
      if (device.platform === "iOS") {
				_saveDirectory = cordova.file.dataDirectory;
			}
			else if (device.platform === "Android") {
				_saveDirectory = cordova.file.externalApplicationStorageDirectory;
			}
			else {
				_saveDirectory = cordova.file.dataDirectory;
			}

				window.resolveLocalFileSystemURL(_saveDirectory ,  function (dir) {
						dir.getDirectory("PDF",{ create: true }, function (finalDir) {
              if (!_fileTransfer) {
								console.log('error.noTransfer');
							}
							if (!_saveDirectory ) {
								console.log('error.noDirectory');
							}

							var fileURL = _saveDirectory  + 'test.pdf';
							var uri = encodeURI($scope.pdf);
							_fileTransfer.download($scope.pdf, fileURL, function (entry) {
								},
								function (error) {
                  console.log(error);
								},
								true
							);
					 });

				});
      }



      $scope.load = function(){
          var ref = cordova.InAppBrowser.open('assets/foo.pdf', '_blank', 'location=no');
      }

      $scope.nav = function(data)
      {
        $state.go('admin-freeForm',{key: data},{reload: true});
      }

      $scope.add= function(){
        var addNewPagePopup = $ionicPopup.confirm({
          title: 'ADD',
          template: 'Do you want to add a new page?'
        });
        addNewPagePopup.then(function(response) {
          if(response)
          {
              $state.go("admin-freeForm", {key: null}, {reload: true});
          }
        });
      }

      $scope.delete = function(key){
        var addNewPagePopup = $ionicPopup.confirm({
          title: 'DELETE',
          template: 'Do you want delete this page?'
        });
        addNewPagePopup.then(function(response) {
          if(response)
          {
            uploadService.delete(key).then(function(result){
              uploadService.retrieveData().then(function(result){
                if(result != null)
                {
                  $scope.title=uploadService.getfreeFormData();
                  $state.go($state.current.name,{},{notify: true});
                }
                else{
                  $scope.title =null;
                }
              })
            }),
              function(error){
                console.log(error);
              }
          }
        });

      }


    /*FILE UPLOAD */
    $scope.setFiles = function(element) {
      $scope.$apply(function($scope) {
        // Turn the FileList object into an Array
          $scope.files= element.files[0];
          var sFileName = $("#pdfUpload").val();
          if (sFileName.length > 0) {
            var blnValid = false;
            for (var j = 0; j < _validFileExtensions.length; j++) {
              var sCurExtension = _validFileExtensions[j];
              if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                blnValid = true;
                var filesSelected = document.getElementById("pdfUpload").files;
                if (filesSelected.length > 0) {
                    var fileToLoad = filesSelected[0];

                    var fileReader = new FileReader();

                    fileReader.onload = function(fileLoadedEvent) {
                      var textAreaFileContents = document.getElementById(
                        "textAreaFileContents"
                      );
                      $scope.pdfDetails.pdfUpload=  fileLoadedEvent.target.result;
                      $scope.pdfDetails.pdfName= $scope.files.name;
                      $scope.$apply();
                      $scope.savePDF(); // calling another function to save data to db (to prevent async)
                    }

                   fileReader.readAsDataURL(fileToLoad);
                }
                break;
              }
            }

            if (!blnValid) {
                var alertPopup = $ionicPopup.alert({
                  title: 'File invalid!',
                  template: ' Insert file of PDF type '
                });
                alertPopup.then(function(res) {
                  $("#fileToUpload").val(null);
                  $("#pdfUpload").val(null);
                });

            }
          }
      });
    }

    $scope.savePDF= function(){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Upload',
        template: 'Do you want to upload a new file ? It would replace the existing file'
      });
      confirmPopup.then(function(res) {
        var flag = false;
        if(res)
        {
          uploadService.savePDF($scope.files);
          $scope.flag = true;
          $scope.containsFile= true;
        }
        else{
           $("#fileToUpload").val(null);
           $("#pdfUpload").val(null);
        }
      });
    }




    $scope.deletePdf = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete',
        template: 'Do you want to remove this file ?'
      });
      confirmPopup.then(function(res) {
        var flag = false;
        if(res)
        {
          $("#fileToUpload").val(null);
          uploadService.deletePDF();
          $scope.containsFile= false;
          $scope.pdfDetails.pdfUpload= "";
          $scope.pdfDetails.pdfName = "";
          $("#pdfUpload").val(null);
          $scope.fileName= "";
          $scope.fileType="";
          $scope.file ="";
          $scope.flag = false;
        }
      });
    }


    $scope.logout= function(){
      $state.go('login', {}, {reload: true});
    }



    $scope.goToUserResults= function(){
        $state.go('admin-chart', {}, {reload: true});
    }

})





.controller('freeFormCtrl', function($scope, $state, uploadService, $firebaseArray, $ionicPopup, $sce, $window) {
  $scope.key = $state.params.key;
  $scope.recordAnswer= {timestamp:"", heading:"", fileUpload: "", fileType: "", fileName: "", text:""};
  $scope.recordAnswer.timestamp = $scope.key;
  $scope.containsFile= false;
  var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png", ".mp4"];
  $scope.heading ="";
  $scope.paraText ="";
  $scope.fileName= "No";


  $scope.isButtonDisabled =  function(){
    if($scope.heading == ""){
      return true;
    }
      return false;
  }


  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  /* RETRIEVING DATA FROM DB IF ANY */
  if($scope.recordAnswer.timestamp.length)
  {
    uploadService.keyBasedSearch($scope.key).then(function(result){
        $scope.heading = result.heading;
        $scope.paraText = result.text;
        $scope.src = result.file;
        if(result.file.length){
          $scope.containsFile= true;
          $scope.fileName= result.fileName;
          $scope.recordAnswer.fileName = result.fileName;
          $scope.recordAnswer.fileType = result.fileType;
          $scope.recordAnswer.fileUpload = result.file;
          if(result.fileType == "video/mp4")
          {
            $scope.video = true;
            $scope.videoRef =  result.file;
            $scope.img = false;

          }

          else{
            $scope.img= true;
            $scope.imgRef =result.file;
            $scope.video = false;
          }
        }

    }),
    function(error){
      console.log(error);
    };
  }


  /*FILE UPLOAD */
  $scope.setFiles = function(element) {
    $scope.$apply(function($scope) {
      // Turn the FileList object into an Array
        $scope.files= element.files[0];
        var sFileName = $("#fileToUpload").val();
        if (sFileName.length > 0) {
          var blnValid = false;
          for (var j = 0; j < _validFileExtensions.length; j++) {
            var sCurExtension = _validFileExtensions[j];
            if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
              blnValid = true;
              var filesSelected = document.getElementById("fileToUpload").files;
              if (filesSelected.length > 0) {
                  var fileToLoad = filesSelected[0];

                  var fileReader = new FileReader();

                  fileReader.onload = function(fileLoadedEvent) {
                    var textAreaFileContents = document.getElementById(
                      "textAreaFileContents"
                    );
                    $scope.containsFile= true;
                    $scope.recordAnswer.fileUpload=  fileLoadedEvent.target.result;
                    $scope.recordAnswer.fileType = $scope.files.type;
                    $scope.recordAnswer.fileName = $scope.files.name;


                    if($scope.files.type == "video/mp4")
                    {
                      $scope.video = true;
                      $scope.videoRef =  fileLoadedEvent.target.result;
                      $scope.img = false;
                    }

                    else{
                      $scope.img= true;
                      $scope.imgRef =fileLoadedEvent.target.result;
                      $scope.video = false;
                    }

                    $scope.fileName= $scope.files.name;
                    $scope.$apply();
                    flag= true;
                  }

                fileReader.readAsDataURL(fileToLoad);
              }
              break;
            }
          }

          if (!blnValid) {
              var alertPopup = $ionicPopup.alert({
                title: 'File invalid!',
                template: 'Insert file with .jpg, .jpeg, .bmp, .gif, .png, .mp4 type'
              });
              alertPopup.then(function(res) {
                $("#fileToUpload").val(null);
                $("#pdfUpload").val(null);
              });
          }
        }
      $scope.progressVisible = false
    });
  };




  /*UPLOADING THE DATE TO DB */
  $scope.uploadFile = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Save',
      template: 'Do you want to save the data?'
    });
    confirmPopup.then(function(res) {
      var flag = false;
      if(res)
      {
        $scope.save();
      }
    });
  }

  $scope.save = function(){
    $scope.recordAnswer.heading =$scope.heading;
    $scope.recordAnswer.text = $scope.paraText;
    uploadService.saveData($scope.recordAnswer);
    uploadService.retrieveData().then(function(result){
      $state.go('admin-summary',{},{reload: true})
    }),
      function(error){
        console.log(error);
      }
  }


  $scope.deleteimg = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete',
      template: 'Do you want to remove this image ?'
    });
    confirmPopup.then(function(res) {
      if(res)
      {
        $("#fileToUpload").val(null);
        $scope.containsFile= false;
        $scope.img= false;
        $scope.imgRef = "";
        $scope.video =false;
        $scope.videoRef ="";
        $scope.recordAnswer.fileUpload= "";
        $scope.recordAnswer.fileType = "";
        $scope.recordAnswer.fileName = "";
        $scope.fileName= "";
        $scope.fileType="";
        $scope.file ="";
      }
    });
  }

  $scope.back=function() {
      $window.history.back();
  }

})


.controller('adminChartCtrl', function($scope, $state, uploadService, $ionicPopup, $window) {
  $scope.group =1;
  $scope.level=1;
  uploadService.userResults($scope.level, $scope.group).then(function(result){
    $scope.labels = ["% questions answered correctly", "% questions answered incorrectly"];
    $scope.result = [result, 100-result];
    $scope.series = ['Series A', 'Series B'];

    }),
    function(error){
      console.log(error);
    }

    $scope.back=function() {
        $window.history.back();
    }

  $scope.logout= function(){
    $state.go('login', {}, {reload: true});
  }
});
