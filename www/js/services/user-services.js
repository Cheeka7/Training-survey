var app= angular.module('user.services', [])
  app.service('UserService', function ( $filter, $q) {
    var test=[];

    var result = {noOfCorrectAnswers:0,
                      noOfQuestions:0};
      var dataSet = [];
      var answerSet=[];
      this.sampleDataSet =[];
      var sampleDataSetLength;
      this.sample={year: 0};
      var database = firebase.database();
      var completeFreeformSet = [];



        this.checking= function(){
            return this.sampleDataSet;
        };


        this.userDataSet= function(companyName, level, group){
           var completeDataSet = [];
           var deferred = $q.defer();
           var ref = database.ref('userData/user/company/' +companyName+ '/level/' +level+ '/group/'+ group);
           this.sample.year = 100;
           ref.once('value', function(snapshot){
               var questionSet = snapshot.val();
               for(var i=0; i< questionSet.length; i++)
               {
                 completeDataSet.push(questionSet[i]);
               }
               deferred.resolve(completeDataSet);
           });
            this.sampleDataSet = completeDataSet;
            return deferred.promise;
         };


         this.setQuestionSetLength= function(){
           sampleDataSetLength = this.sampleDataSet.length;
         }

         this.getQuestionSetLength= function(){
           return sampleDataSetLength;
         }


        this.selectQuestion= function() {
          var i;
          for(i= 0; i<sampleDataSetLength; i++)
          {
            dataSet.push(this.sampleDataSet[i]);
          }
          return dataSet[0];
        };




        this.getQuestion= function (index) {
              return dataSet[index];
        };

        this.recordAnswer= function(answer){
            answerSet.push(answer);
        };

        this.setAlreadyLoggedIn= function(flag){
            var currentUserID = firebase.auth().currentUser.uid;
            var ref = database.ref('userData/account');
            ref.on('value', function(snapshot){
              var userProfile = snapshot.val();
              var user = userProfile[currentUserID];
              ref.child(currentUserID).update({
                username: user.username,
                userID:  user.userID,
                company:  user.company,
                level:  user.level,
                HasAlreadyLoggedIn: true
          });
        })
      };

      this.evaluate= function(){
          var i=0;
          var counter = 0;
          for(i=0; i< answerSet.length; i++)
          {
            if(dataSet[i].type == "checkbox")
            {
              var filteredAnswer= $filter('orderBy')(Object.keys(answerSet[i]));
              var answer= angular.equals(filteredAnswer, dataSet[i].answer);
              if(answer)
              {
                result.noOfCorrectAnswers++;
              }
            }
            else {
                if(dataSet[i].answer == answerSet[i])
                  {
                      result.noOfCorrectAnswers++;
                  }
            }
          }

          result.noOfCorrectAnswers= result.noOfCorrectAnswers+ counter;
          var successPercentage = 0;
          var successPercentage = $filter('number')((result.noOfCorrectAnswers/ answerSet.length)*100, 2);
          var noOfWrongAnswers = answerSet.length - result.noOfCorrectAnswers;
          result.noOfQuestions = answerSet.length;
          var userID = firebase.auth().currentUser.uid;
          var ref = database.ref('userData/account');
          ref.child(userID).update({
            userID: userID,
            resultPercentage: successPercentage
          });
          return result;
        };

        this.retrieveFreeFormData = function(){
          var freeFormSet=[];
          var ref = database.ref('userData/admin');
          var deferred = $q.defer();
          ref.once('value', function(snapshot){
              var sourcefile = snapshot.val();
              angular.forEach(sourcefile, function(value, key) {
                if(key != "pdfDetails"){
                  freeFormSet.push(value);
                }
              });

                completeFreeformSet = freeFormSet;
              deferred.resolve();

          });
           return deferred.promise;
        }



        this.getfreeFormData= function (index) {
              return completeFreeformSet[index];
        }

        this.getfreeformLength= function(){
          return completeFreeformSet.length;
        }

        this.download =  function(){
          var deferred = $q.defer();
          var storageRef = firebase.storage().ref();
          // Create a reference to the file we want to download
          var starsRef = storageRef.child('pdf/main.pdf');

          // Get the download URL
          starsRef.getDownloadURL().then(function(url) {
              deferred.resolve(url);
            // Insert url into an <img> tag to "download"
          }).catch(function(error) {
              deferred.reject(error);
          });
           return deferred.promise;
        }
    });
