angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('LabCtrl', function($q,$scope,$ionicLoading,$timeout,$cordovaGeolocation,$cordovaNetwork,$ionicPlatform,$cordovaDeviceOrientation,Restangular,NetworkSpeed) {
  $scope.signal =0;
  $scope.lat =0;
  $scope.long =0;
  $scope.type =0;
  $scope.X =0;
  $scope.network=0;
  $scope.date =0;
  $scope.Z =0;
  $scope.labDatas =[];

  $scope.interval = {
    interval:300000,
    currentInterval:0,
    rest:0
  };

  var restTimer;

  $scope.timer = null;


  var posOptions = {timeout: 10000, enableHighAccuracy: true};

  var labData = function(date,lat,long,network,heading,accuracy,bandwidth){
    this.date = date;
    this.lat = lat;
    this.long = long;
    this.network = network;
    this.heading = heading;
    this.accuracy = accuracy;
    this.bandwidth = bandwidth;
  };


  $scope.getInfo = function(){
    $ionicLoading.show({
      template: 'Loading...'
    });
    $scope.date = new Date();
    var netPromise = NetworkSpeed.getNetSpeed();
    var locationPromise = $cordovaGeolocation.getCurrentPosition(posOptions);
    var headPromise = $cordovaDeviceOrientation.getCurrentHeading();

    $q.all([netPromise,locationPromise,headPromise]).then(function(res){
      var netInfo = res[0];
      var position = res[1];
      var head = res[2];
      $scope.network=netInfo.speed;
      $scope.netType = netInfo.type;
      $scope.lat  = position.coords.latitude;
      $scope.long = position.coords.longitude;
      $scope.X = head.magneticHeading.toFixed(2);
      $scope.Z = head.headingAccuracy;
      var tempLabData = new labData(new Date().toString(),$scope.lat,$scope.long,$scope.netType,$scope.X,$scope.Z,$scope.network);

      if(tempLabData.network === 'offline'){
        $ionicLoading.hide();
        $scope.labDatas.push(tempLabData);
        return;
      }else if($scope.labDatas.length){
        $ionicLoading.hide();
        $scope.labDatas.push(tempLabData);
        $scope.submitData();
        return;
      }
      Restangular.one('/').post('lab',tempLabData).then(function(data){
        $ionicLoading.hide();
          console.log(data);
      })
    }).catch(function(err){
      $ionicLoading.hide();
      $scope.dataErr=JSON.stringify(err,null,2);
    });

  };

  $scope.submitData = function(){
    if($scope.labDatas.length!=0){
      $ionicLoading.show({
        template: 'Loading...'
      });
      var promises = [];
      $scope.labDatas.forEach(function(data){
        promises.push(Restangular.one('/').post('lab',data));
      });
      $q.all(promises).then(function(data){
        $ionicLoading.hide();
        $scope.labDatas =[];
      }).catch(function(err){
        $ionicLoading.hide();
        $scope.dataErr=JSON.stringify(err,null,2);
      })

    }
  };

  $scope.startInterval = function(){
    $scope.interval.currentInterval = $scope.interval.interval;
    $scope.interval.rest = 0;
    $scope.timer = setInterval(function(){
      $scope.interval.rest = 0;
      $scope.getInfo();
    },$scope.interval.interval);

    restTimer = setInterval(function(){
      $scope.$apply(function(){
        $scope.interval.rest +=1000;
      });
    },1000)
  };

  $scope.stopInterval = function(){
    if($scope.timer){
      clearInterval($scope.timer);
      clearInterval(restTimer);
    }
    $scope.timer = null;
  };

  $ionicPlatform.ready(function() {

    $scope.getInfo();

  });


})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
