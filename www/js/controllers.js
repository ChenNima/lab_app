angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($q,$scope,$cordovaGeolocation,$cordovaNetwork,$ionicPlatform,$cordovaDeviceOrientation,NetworkSpeed) {
  $scope.signal =0;
  $scope.lat =0;
  $scope.long =0;
  $scope.type =0;
  $scope.X =0;
  $scope.network=0;
  $scope.date =0;


  var posOptions = {timeout: 10000, enableHighAccuracy: true};

  $scope.getInfo = function(){
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
      $scope.X = head.magneticHeading;
      $scope.Z = head.headingAccuracy;
    });

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
