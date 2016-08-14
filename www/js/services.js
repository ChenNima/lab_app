angular.module('starter.services', [])

  .factory('NetworkSpeed', function ($q, $cordovaNetwork, $ionicPlatform, $http) {
    var deferred;
    var downloadSize = 97615;
    var imageAddr = "http://file.mrchen.pub/test.jpg";
    var startTime, endTime = 0;
    var netType = 0;

    function showResults(startTime, endTime, downloadSize) {
        var duration = (endTime - startTime) / 1000; //Math.round()
        var bitsLoaded = downloadSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(2);
        var speedKbps = (speedBps / 1024).toFixed(2);
        var finalSpeed = (speedKbps / 8);
        deferred.resolve({type:netType,speed:finalSpeed});
    }

    return {
      getNetSpeed: function () {
        deferred = $q.defer();
        $ionicPlatform.ready(function () {
          try {
            if ($cordovaNetwork.isOnline()) {
              netType = $cordovaNetwork.getNetwork();
              var r = Math.round(Math.random() * 10000);
              startTime = (new Date()).getTime();
              $http.get(imageAddr+ "?subins=" + r)
                .success(function (response) {
                  endTime = (new Date()).getTime();
                  showResults(startTime, endTime, downloadSize);
                  }
                )
                .error(function(err){
                console.log(err);
              });
            }else{
              deferred.resolve({type:'offline',speed:0});
            }
          } catch (e) {
            console.log(e);
            deferred.resolve({type:'offline',speed:0});
          }
        });
        return deferred.promise;
      }
    }
  });
