angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($q,$scope,$ionicLoading,$timeout,$cordovaGeolocation,$cordovaNetwork,$ionicPlatform,$cordovaDeviceOrientation,Restangular,NetworkSpeed) {
  $scope.signal =0;
  $scope.lat =0;
  $scope.long =0;
  $scope.type =0;
  $scope.X =0;
  $scope.network=0;
  $scope.date =0;
  $scope.Z =0;
  $scope.labDatas =[];


  var posOptions = {timeout: 10000, enableHighAccuracy: true};

  var labData = function(date,lat,long,netwrok,heading,accuracy,bandwidth){
    this.date = date;
    this.lat = lat;
    this.long = long;
    this.network = netwrok;
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

  $ionicPlatform.ready(function() {

    $scope.getInfo();

  });


})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
