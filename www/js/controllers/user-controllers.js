angular.module('user.controllers', [])

.controller('loginCtrl', function($scope, $state, $firebaseAuth, $ionicModal, UserService, $timeout, uploadService) {;
  $('#loginemailerror').hide();
  $('#loginpwerror').hide();
  $scope.user = {  email: "",  password: ""};
  $scope.login = function(){
     if($scope.user.email=="")
     {
        $('#loginemail').hide();
        $('#loginemailerror').show();
     }
     else
     {
        $('#loginemail').show();
        $('#loginemailerror').hide();
     }
     if($scope.user.password=="")
     {
        $('#login_password').hide();
        $('#loginpwerror').show();
     }
     else
     {
        $('#login_password').show();
        $('#loginpwerror').hide();
     }
     var auth=$firebaseAuth();
     auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(){
        $scope.errorMsg= false;
        var database= firebase.database();
        var currentUserID = firebase.auth().currentUser.uid;
        var userID= [];
        var ref= database.ref('userData/account');
        ref.once('value', function(snapshot){
          var userProfile = snapshot.val();
          if(userProfile[currentUserID].role == "admin")
          {
              uploadService.retrieveData().then(function(result){
              $state.go('admin-summary',{},{reload: true})
              }),
              function(error){
                console.log(error);
              }
          }
          else
          {
              var user= userProfile[currentUserID];
              var company= userProfile[currentUserID].company;
              var level= userProfile[currentUserID].level;
              var group= userProfile[currentUserID].group;
              $scope.completeDataSet =[];
              UserService.userDataSet(company, level, group).then(function(completeDataSet) {
                UserService.retrieveFreeFormData().then(function(response) {
                  if(user.HasAlreadyLoggedIn)
                  {
                    $state.go('intro',{flag: 0},{reload: true})
                  }
                  else{
                     $state.go('changePassword',{},{reload: true});
                  }
                })
              }),
              function(error){
                console.log(error);
              };
          }
        })
        // User successfully logged in
      }).catch(function(error) {
          $scope.errorMsg= true;
          $scope.errorMessage= error.message;
      });
    }
  })



.controller('changePasswordCtrl', function($scope, $state, UserService, $firebaseAuth, $window) {
  $('#newpwerror').hide();
  $('#confirmpwerror').hide();
  $scope.user = {
  changePassword: "",
  confirmPassword: ""
  };

  $scope.checkPasswordLength = function(){
    if($scope.user.changePassword.length >=6 && $scope.user.confirmPassword.length >=6){
      return false;
    }
    return true;

  }
  $scope.save = function(){
    if($scope.user.changePassword=="")
     {
       $('#new_password').hide();
       $('#newpwerror').show();
     }
     else{
       $('#new_password').show();
       $('#newpwerror').hide();
     }
     if($scope.user.confirmPassword=="")
     {
       $('#confirm_password').hide();
       $('#confirmpwerror').show();
     }
     else{
       $('#confirm_password').show();
       $('#confirmpwerror').hide();
      }

    if($scope.user.changePassword == $scope.user.confirmPassword)
    {
      var id = firebase.auth().currentUser;
      id.updatePassword($scope.user.confirmPassword).then(function() {
        UserService.setAlreadyLoggedIn(true);
        $state.go('intro',{},{reload: true});
        // Update successful.
      }).catch(function(error) {
          $scope.errorMsg= true;
          $scope.errorMessage= error.message;
      });
    }
    else{
      $scope.saveButton= false;
      $scope.errorMsg= true;
      $scope.errorMessage= "Passwords dont match";
    }
  }

  $scope.back=function()
   {
      $window.history.back();
   }

})





.controller('forgotPasswordCtrl', function($scope, $state, UserService, $firebaseAuth, $window) {
  $scope.errorMessage="";
  $scope.user = {
  email: ""
  };
  $('#forgotPasswordEmailError').hide();
  $scope.sendEmail= function(){
    if($scope.user.email=="")
     {
       $('#forgotPasswordEmail').hide();
       $('#forgotPasswordEmailError').show();
     }

      var auth = firebase.auth();
      auth.sendPasswordResetEmail($scope.user.email).then(function() {
      alert("A mail has been sent successfully");
      $scope.errorMsg= false;
        // Email sent.
      }).catch(function(error) {
          console.log(error);
          $scope.errorMsg= true;
          $scope.errorMessage= error.message;
          $scope.$apply();
      });
      console.log($scope.errorMessage);
    }

    $scope.back=function(){
      $window.history.back();
    }
  })



.controller('introCtrl', function($scope, $state, UserService, $firebaseAuth, $window, $sce) {
    $scope.flag= $state.params.flag;
    $scope.noOfFreeforms= UserService.getfreeformLength();
    if($scope.noOfFreeforms)
    {
        var source= UserService.getfreeFormData($scope.flag);
        $scope.sourceFile = source;
        $scope.heading = source.heading;
        $scope.paraText= source.text;
        $scope.parts = $scope.paraText.split("\n");  // for splitting it into separate lines

        if(source.fileType == "video/mp4")
        {
          $scope.video = true;
          $scope.videoRef= source.file;
        }
        else{
          $scope.img = true;
          $scope.imgRef= source.file;
        }

        $scope.flag++;

        $scope.trustSrc = function(src) {
          return $sce.trustAsResourceUrl(src);
        }
        $scope.next= function(){
          if($scope.noOfFreeforms == $scope.flag)
          {
            $state.go('welcome',{},{reload: true});
          }
          else {
              $state.go($state.current.name,{flag: $scope.flag},{notify: true});
          }
        }
      }
      else
      {
        $state.go('welcome',{},{reload: true});
      }

      $scope.back=function() {
        $window.history.back();
      }
      $scope.logout= function(){
        $state.go('login', {}, {reload: true});
      }
})




.controller('welcomeCtrl', function(UserService, $scope, $ionicSlideBoxDelegate, $state, $window, $sce, $location, $ionicLoading, $cordovaFileTransfer, $ionicPopup) {
        $scope.navSlide = function(index) {
          $ionicSlideBoxDelegate.slide(index, 500);
    }

    UserService.download().then(function(result) {
        $scope.pdf = result;
    }),
    function(error){
      console.log(error);
    };


    $scope.download = function(){
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
                  var alertPopup = $ionicPopup.alert({
                    title: 'Download Success',
                    template: 'File Downloaded!'
                  });
                  alertPopup.then(function(res) {
                  });
                },
                function (error) {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Download Error!',
                    template: 'Failed!'
                  });
                  alertPopup.then(function(res) {
                  });
                  console.log(error);
                },
                true
              );
           });

        });
    }

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }

    UserService.setQuestionSetLength();
    $scope.question= UserService.selectQuestion();

    $scope.next = function(){
        $state.go($scope.question.type,{counter:0},{reload: true});
    }

    $scope.logout= function(){
      $state.go('login', {}, {reload: true});
    }

    $scope.back=function(){
      $window.history.back();
    }

})







.controller('questionCtrl', function(UserService, $scope, $ionicSlideBoxDelegate, $state, $filter, $sce, $window) {
   $scope.data1 = { 'rating' : '5' };
   $scope.item={};
   $scope.choice = {};
   $scope.checkItems={};
   $scope.textAnswer="" // for text box question type
   $scope.counter = $state.params.counter;
   $scope.questionSetLength= UserService.getQuestionSetLength(); // length of the set of questions in db

   //last question should have submit button
   if($scope.counter != $scope.questionSetLength-1 ){

      $scope.buttonText= "Next";
   }
   else{
     $scope.buttonText= "Submit";
   }

   //FOR CHECKBOX DISABLE FUNCTIONALITY
  $scope.checkLength = function(){
    if(Object.keys($scope.checkItems).length > 0){
      return false;
    }
      return true;
  }


// FOR TEXTBOX DISABLE FUNCTIONALITY
  $scope.checkTextLength =  function(){
    if($scope.textAnswer ==""){
      return true;
    }
      return false;
  }

   $scope.dataSet= UserService.getQuestion($scope.counter);
   $scope.counter++;
   $scope.img = false;
   if($scope.dataSet.containsImage === "yes")
   {
     $scope.img = true;
     $scope.imgRef= $scope.dataSet.image;
   }

   $scope.video = false;
  if($scope.dataSet.containsVideo === "yes")
  {
    $scope.video = true;
    $scope.videoRef= $scope.dataSet.video;
  }

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  $scope.record = function(answer){
      UserService.recordAnswer(answer);
      if($scope.counter!= $scope.questionSetLength){
          $scope.question= UserService.getQuestion($scope.counter);
          $state.go($scope.question.type,{counter: $scope.counter}, {reload: true});
      }  else {
          $scope.result = UserService.evaluate();
          $state.go('chart',{noOfCorrectAnswers: $scope.result.noOfCorrectAnswers, noOfQuestions: $scope.result.noOfQuestions},{reload: true});
      }
    }
})




.controller('thankyouCtrl', function($scope, $state, $window) {
  $scope.noOfCorrectAnswers= $state.params.noOfCorrectAnswers;
  $scope.noOfQuestions= $state.params.noOfQuestions;

  $scope.logout= function(){
    $state.go('login', {}, {reload: true});
  }

  $scope.back=function(){
    $window.history.back();
  }
})


.controller('chartCtrl', function($scope, $state, $filter) {
  $scope.noOfCorrectAnswers= $state.params.noOfCorrectAnswers;
  $scope.noOfQuestions= $state.params.noOfQuestions;
  $scope.labels = ["% questions answered correctly", "% questions answered incorrectly"];
  $scope.successPercentage = $filter('number')((  $scope.noOfCorrectAnswers/ $scope.noOfQuestions)*100, 2);
  $scope.data = [$scope.successPercentage, 100 - $scope.successPercentage];
  $scope.series = ['Series A', 'Series B'];

  $scope.logout= function(){
    $state.go('login', {}, {reload: true});
  }

});
