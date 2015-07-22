angular.module('Calendar.controller', ['config', 'starter.services'])

  .controller('CalendarCtrl', function($scope, $state, User, Treatment, Patient, $http, $mdDialog, $rootScope, $timeout, Cycle, moment, uiCalendarConfig) {
 
   if(typeof sessionStorage['token'] === 'undefined'){
    $state.go('login')
  }

var today = moment()

$scope.loadingCalendar = false; 
$scope.monthCalLoading = "monthCalLoading"
$scope.loadingFirstTime = true;

var loadingFunction = function(){
    $scope.monthCalLoading = ""; 
    $scope.loadingCalendar = false;  
    $scope.loadingFirstTime = false;
}


$scope.nextMonth = function(){
  $scope.view.next()
  today = today.add(1, 'months')
    $scope.loadingCalendar = true; 
    Treatment.getTreatmentForMonth($scope.userProfile.patientProfiles[0], today).then(function(treat){   
      $scope.createDrugEventsforWeek(treat.data.data) 
    })

}

$scope.prevMonth = function(){
  
  $scope.view.prev()
  today = today.subtract(1, 'months')
    $scope.loadingCalendar = true; 
    Treatment.getTreatmentForMonth($scope.userProfile.patientProfiles[0], today).then(function(treat){   
      $scope.createDrugEventsforWeek(treat.data.data) 
    })

}

    



    Date.prototype.addHours = function(h) {
      this.setHours(this.getHours() + h);
      return this;
    }
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.compare = function(a, b) {
      if (a.time < b.time)
        return -1;
      if (a.time > b.time)
        return 1;
      return 0;
    }



    //////////////////////////////////////Begin Getting Drug Events//////////////////////////////////////////////////////////

    $scope.createDrugEventsforWeek = function(treatmentBundles) {
      
      $scope.DrugsForColorKey = []
        for (var i = 0; i < treatmentBundles.length; i++) {
        if(treatmentBundles[i].status === "discontinued" || treatmentBundles[i].status === "pending"){
           continue;
          }

          for (var j = 0; j < treatmentBundles[i].drug.usages.length; j++) {
            for (var g = 0; g < treatmentBundles[i].drug.usages[j].tick.length; g++) {
                if(!treatmentBundles[i].drug.usages[j].tick[g].scheduleDates){
                continue;
              }
              for (var h = 0; h < treatmentBundles[i].drug.usages[j].tick[g].scheduleDates.length; h++) {
                if(treatmentBundles[i].status === "onhold"){
                  if (new Date(new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h])) > new Date(treatmentBundles[i].heldAt)){     
                    continue; 
                  } 
                }
                $scope.drugsForMonth = {
                  title: treatmentBundles[i].name,
                  start: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]),
                  end: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).addHours(1),
                  allDay: false,
                  colorClass: "colorclass" + i,
                  className: "colorclass" + i,
                  time: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).getTime()
                }
                $scope.eventSources[i].events.push($scope.drugsForMonth)
              }
            }
          }
        }

        for (var z = 0; z < $scope.eventSources.length-1; z++) {
          if($scope.eventSources[z].events[0] === undefined){
            continue;  
          }
          var obj1 = {
            name: $scope.eventSources[z].events[0].title,
            colorClass: $scope.eventSources[z].events[0].colorClass
          }

          $scope.DrugsForColorKey.push(obj1)
        }


        for (var g = 0; g < $scope.eventSources.length; g++) {
        $scope.eventSources[g].events.sort($scope.compare)
          for (var p = 0; p < $scope.eventSources[g].events.length - 1; p++) {
            if ($scope.eventSources[g].events[p].start.toDateString() === $scope.eventSources[g].events[p + 1].start.toDateString()) {
              $scope.eventSources[g].events.splice(p, 1)
              p --
            }
          }
        }

        $timeout(loadingFunction, 1)

          
      }

   
  
    User.getCurrentUser().then(function(user) {
      $scope.userProfile = user.data.data
      $rootScope.userID = $scope.userProfile.patientProfiles[0]
      Treatment.getTreatmentForMonth($scope.userProfile.patientProfiles[0], today).then(function(treat){
            $scope.createDrugEventsforWeek(treat.data.data)
        })
    })



    /* config object */
    $scope.uiConfig = {
      calendar: {
        // height: 450,
        // editable: true,
        header: {
          left: '',
          center: 'title',
          right: ''
        },
        dayClick: $scope.showModal,
        eventClick: $scope.showModal, 
        viewRender: function(view){
          $scope.view = view.calendar
          

        }
      }
    };

         $scope.eventSources = [

      {
        events: [],
        color: '#2196F3',
        textColor: '#2196F3',
        className: 'drugsForMonthView'
      },

      {
        events: [

        ],
        color: '#E040FB',
        textColor: '#E040FB',
        className: 'drugsForMonthView'
      },

      {
        events: [

        ],
        color: '#1B5E20',
        textColor: '#1B5E20',
        className: 'drugsForMonthView'
      },

      {
        events: [

        ],
        color: '#0097A7',
        textColor: '#0097A7',
        className: 'drugsForMonthView'
      },

      {
        events: [

        ],
        color: '#304FFE',
        textColor: '#304FFE',
        className: 'drugsForMonthView'
      },

      {
        events: [

        ],
        color: '#FFEB3B',
        textColor: '#FFEB3B',
        className: 'drugsForMonthView'
      },


      {
        events: [

        ],
        color: '#4E342E',
        textColor: '#4E342E',
        className: 'drugsForMonthView'
      },

      {
        events: [

        ],
        color: '#FF6F00',
        textColor: '#FF6F00',
        className: 'drugsForMonthView'
      },

      {
        events: [

        ],
        color: '#2196F3',
        textColor: '#2196F3',
        className: 'drugsForMonthView'
      }, 

      {
        events: [],
        borderColor: "transparent", 
        className: "monthTask", 
        color: 'transparent'
        
      }


    ]




  });