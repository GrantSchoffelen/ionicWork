angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
  .factory('User', function($http, ENV) {


    return {
      getCurrentUser: function() {
        return $http.get(ENV.apiUrl + "/me")
      }

    };
  }) .factory('Survey', function ($http, ENV, $q) {
    
    return {
      getSurvey: function (bundleId) {

        
        return $http.get(ENV.apiUrl + "/survey?targetId=adherence__" + bundleId)
      }, 

      postSurveyReply: function(reply){

        return $http.post(ENV.apiUrl + "/surveyreply", reply)

      }, 

      

      getSymptomSurvey: function(patientId){
        var deferred = $q.defer(); 
       return  $http.get(ENV.apiUrl +"/survey?targetId=symptom__"+ patientId).then(function(surveys){
        deferred.resolve(surveys)
        return deferred.promise
       })
      }, 

      postSymptomSurvey: function(reply){
        var deferred = $q.defer();
        return $http.post(ENV.apiUrl+ "/surveyreply", reply).then(function(reply){
          deferred.resolve(reply); 
          console.log(reply, 'reply')
          return deferred.promise
        })
      }



    }

  })
    .factory('Cycle', function($http, ENV, $q) {


     return {
      getCurrentStepsForBundle: function(patientId, startDate, endDate, bundleId, bundleName) {
        var deferred = $q.defer()
        $http.get(ENV.apiUrl + "/cycle?bundleId=" + bundleId + "&date%5B%5D=" + startDate + "&date%5B%5D=" + endDate + "&patient=" + patientId + "&state%5B%5D=open&state%5B%5D=pending&state%5B%5D=cantcomplete&state%5B%5D=complete")
          .success(function(data) {
            deferred.resolve({
              title: bundleName,
              steps: data.data,
              id: bundleId,
              all: data
            });
          }).error(function(msg, code) {
            deferred.reject(msg);
            $log.error(msg, code)
          });
        return deferred.promise;
      }
    };
  })
    .factory('Patient', function($http, ENV) {


    return {
       getCurrentPatientInformation: function (patientId) {
        return $http.get(ENV.apiUrl + "/patient/" + patientId)
      }

    };
  })
    .factory('Adherence', function($http, ENV, $q) {


    return {
    getAdherenceOneDay: function(patientId, fromDay, untilDay) {
        var deferred = $q.defer();
        return $http.get(ENV.apiUrl + "/bundle/adherence?patient=" + patientId + '&from=' + fromDay + '&until=' + untilDay).then(function(surveys){
          deferred.resolve(surveys)
          return deferred.promise
        })
      }

    };
  })
   .factory('Treatment', function ($http, ENV) {
  

    return {
      getTreatmentBundles: function(patientId) {
        return $http.get(ENV.apiUrl + "/bundle?patient=" + patientId+"&drug-schedule-dates=1")
      }, 
    getTreatmentScheduleForOneDay: function(patientId, year, month, date){


      var fromDate = new Date(year, month, date).getDate()
      var fromMonth = new Date(year, month, date).getMonth()+1
      var fromDateYear = new Date(year, month, date).getFullYear()
      var untilDate = new Date(year, month, date + 1).getDate()
      var untilDateMonth = new Date(year, month, date + 1).getMonth()+1
      var untilDateYear = new Date(year, month, date + 1).getFullYear()
   

      // month=month+1
      if (fromMonth.length===1){
        fromMonth = "0"+fromMonth
      }
        if (untilDateMonth.length===1){
        untilDateMonth = "0"+untilDateMonth
      }
      if(fromDate.length===1){
        fromDate = "0"+fromDate
      }
      if(untilDate.length===1){
        untilDate = "0"+untilDate
      }

      if(untilDateMonth === 0 || untilDateMonth === "0" || untilDateMonth === "00"){
        untilDateMonth = "01"
      }

       if(fromMonth === 0 || fromMonth === "0" || fromMonth === "00"){
        fromMonth = "01"
      }


        return $http.get(ENV.apiUrl + "/bundle?patient="+ patientId+"&drug-schedule-dates=1&drug-schedule-from="+fromDateYear+"-"+fromMonth+"-"+fromDate+"&drug-schedule-until="+untilDateYear+"-"+untilDateMonth+"-"+untilDate)
      }, 

    getTreatmentForMonth: function(patientId, startYear, startM, startDate, endY, endM, endDate){ 
      var startMonth = new Date (startYear, startM, startDate).getMonth()+1
      var endMonth = new Date(endY, (endM+1), endDate).getMonth()
      var endYear = new Date (endY, (endM+1), endDate).getFullYear()
      
      

      if (startMonth.length === 1){
        startMonth = "0"+ startM 
      }
      if (endMonth.length===1){
        endMonth = "0"+ endM
      }
      if(startDate.length===1){
        startDate = "0"+startDate
      }
      if(endDate.length===1){
        endDate = "0"+endDate
      }

      if(endMonth === "00" || endMonth === 0 || endMonth === "0"){
        endMonth = "01"
      }

       if(startMonth === "00" || startMonth === 0 || startMonth === "0"){
        startMonth = "01"
      }

    

        return $http.get(ENV.apiUrl + "/bundle?patient="+ patientId+"&drug-schedule-dates=1&drug-schedule-from="+startYear+"-"+startMonth+"-"+startDate+"&drug-schedule-until="+endYear+"-"+endMonth+"-"+endDate)

    }
    };
  })
.factory('Survey', function ($http, ENV, $q) {
    
    return {
      getSurvey: function (bundleId) {

        
        return $http.get(ENV.apiUrl + "/survey?targetId=adherence__" + bundleId)
      }, 

      postSurveyReply: function(reply){

        return $http.post(ENV.apiUrl + "/surveyreply", reply)

      }, 

      

      getSymptomSurvey: function(patientId){
        var deferred = $q.defer(); 
       return  $http.get(ENV.apiUrl +"/survey?targetId=symptom__"+ patientId).then(function(surveys){
        deferred.resolve(surveys)
        return deferred.promise
       })
      }, 

      postSymptomSurvey: function(reply){
        var deferred = $q.defer();
        return $http.post(ENV.apiUrl+ "/surveyreply", reply).then(function(reply){
          deferred.resolve(reply); 
          console.log(reply, 'reply')
          return deferred.promise
        })
      }



    }

  });