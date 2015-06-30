angular.module('starter.controllers', ['config', 'ipCookie', 'starter.services'])

.controller('DashCtrl', function($scope, ipCookie, $rootScope, User, Treatment, Survey) {
  console.log(ipCookie("token"))
$scope.token = ipCookie("token")
    if ($scope.token) {
      $rootScope.currentUserSignedIn = true
    }
    if (!$scope.token) {
      $location.path('/login')
    }



     $scope.postSymptomSurveyReply = function(survey){
      var promise; 
      survey.questions.forEach(function(question){
          if(question.response >0){
              var reply = {
                  survey: survey._id,
                    question: question._id,
                    session: "Symptom",
                    patient: $scope.userId,
                    submitted: new Date(),
                    submittedFor: new Date(),
                    value: {reason: question.questionText, 
                                response: question.response, 
                                type: 'symptom', 
                                sideEffect: question.sideEffect, 
                                bundleId: question.bundleId
                            },
                                 
                    score:  question.response
                    }
            if(!promise){
              promise = Survey.postSymptomSurvey(reply); 
            
                }else{
              promise = promise.then(function(){
                return Survey.postSymptomSurvey(reply); 
              }); 
             }
            question.response = 0; 
        }

                    if(isNaN(question.response)){
                var replyFreeQuestion = {
                        survey: survey._id,
                        question: question._id,
                        session: "Symptom",
                        patient: $scope.userId,
                        submitted: new Date(),
                        submittedFor: new Date(),
                        value: {reason: question.response, 
                                response: null, 
                                type: 'symptom', 
                                sideEffect: [{name: 'Unknown'}], 
                                bundleId: question.bundleId
                            },
                        score:  null
                    }; 
                if(!promise){
                    promise = Survey.postSymptomSurvey(replyFreeQuestion); 
                
                }else{
                    promise = promise.then(function(){
                        return Survey.postSymptomSurvey(replyFreeQuestion); 
                    }); 
                 }
                question.response = ""; 
            }
      }); 
      // $scope.showAdvanced(); 
    }; 

   

    $scope.userInput = {
      otherSymptoms: '' 
    }; 

    User.getCurrentUser().then(function(user) {
      $scope.userProfile = user.data.data; 
      console.log($scope.userProfile)
      $scope.userId = user.data.data.patientProfiles[0]; 
            Treatment.getTreatmentBundles($scope.userId).then(function(treatments){
                $scope.treatments = treatments.data.data
                console.log($scope.treatments)
            
      Survey.getSymptomSurvey($scope.userId).then(function(result){
        $scope.symptomSurvey = result.data.data[0];
        $scope.symptomSurvey.questions.forEach(function(question){
          question.response = 0; 
                    question.sideEffect = []; 
                    if(question.questionText === 'Are you experiencing any other symptoms?'){
                        question.response = ""; 
                    }

                $scope.treatments.forEach(function(treatment){
                    treatment.sideEffects.forEach(function(sideEffect){
                        sideEffect.symptoms.forEach(function(symptom){
                            if(symptom === question.questionText){
                                question.sideEffect.push(sideEffect)
                            question.bundleId = treatment._id
                            }


                        })
                    })

                })
        }); 
      });
            })
    }); 

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('LoginCtrl', function($scope, $http, $location, $rootScope, ENV, ipCookie, $state) {
 
 $scope.user = {};
      $scope.login = function(user, success, error) {

      $http
        .post(ENV.apiUrl + '/auth/login', user)
        .success(function(data, status, header, config) {
          ipCookie("token", data.data.token);
          $http.defaults.headers.common.Authorization = 'Bearer ' + ipCookie("token")
          $state.go('tab.dash')

        })
        .error(function(data, status, header, config) {
          
            $scope.loginError = data
            console.log($scope.loginError)
          
        });
    }
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
