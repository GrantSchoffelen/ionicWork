angular.module('starter.controllers', ['config', 'starter.services'])

.controller('DashCtrl', function($scope, $rootScope, User, Treatment, Survey,  $stateParams, $state, $ionicLoading) {
      
    User.getCurrentUser().then(function(user) {
      $scope.userProfile = user.data.data;
      $scope.loading = true; 
      $scope.userId = user.data.data.patientProfiles[0]; 
            Treatment.getTreatmentBundles($scope.userId).then(function(treatments){
                $scope.treatments = treatments.data.data
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
        $scope.loading = false;
            });
        }); 
    }); 

    if(typeof sessionStorage['token'] === 'undefined'){
        $state.go('login')
    }; 
    $scope.userInput = {
      otherSymptoms: '' 
    }; 

        $scope.postSymptomSurveyReply = function(survey){
                var promise, 
                    surveyReplyQuestions = [], 
                    surveyReply = {
                        survey: survey._id,
                        question: survey.questions[0]._id,
                        session: "Symptom",
                        patient: $scope.userId,
                        submitted: new Date(),
                        submittedFor: new Date(),
                        value: {}, 
                        score:  0
                    }; 
                survey.questions.forEach(function(question){      
                    if(question.response >0){
                      var questionReply = {
                          survey: survey._id,
                            question: question._id,
                            type: "symptom",
                            patient: $scope.userId,
                            submitted: new Date(),
                            reason: question.questionText, 
                            score:  question.response, 
                                sideEffect: question.sideEffect, 
                                bundleId: question.bundleId 
                            };
                            surveyReplyQuestions.push(questionReply); 
                            question.response = 0; 
                    }

                    if(isNaN(question.response)){
                        var questionReply = {
                                survey: survey._id,
                                question: question._id,
                                type: "symptom",
                                patient: $scope.userId,
                                submitted: new Date(),
                                reason: question.response, 
                                score: null, 
                                sideEffect: [{name: 'Unknown'}], 
                                bundleId: question.bundleId
                            }; 
                        surveyReplyQuestions.push(questionReply);      
                        question.response = ""; 
                    }
                }); 
                surveyReply.value = surveyReplyQuestions; 
                Survey.postSurveyReply(surveyReply).then(function(response){
                    $ionicLoading.show({ template: 'Report Sent!', noBackdrop: true, duration: 2000 })     
                })
        }; 
    
})


.controller('LoginCtrl', function($scope, $http, $location, $rootScope, ENV, $state, Idle, Treatment) {


    sessionStorage.clear();
    sessionStorage.removeItem('token');
    $scope.user =  {};

    $scope.user.email = localStorage['mobileEmail']
    $scope.login = function(user, success, error) {
      $scope.loading = true; 
        $http
            .post(ENV.apiUrl + '/auth/login', user)
            .success(function(data, status, header, config) {
                Idle.watch();
                sessionStorage['token'] = data.data.token;  
                localStorage['mobileEmail'] = $scope.user.email;              
                $http.defaults.headers.common.Authorization = 'Bearer ' + sessionStorage['token'] 
                $state.go('tab.today')
                $scope.loading = false; 
            })
            .error(function(data, status, header, config) {
                $scope.loginError = data;
                $scope.loading = false;
            });
    }
})

