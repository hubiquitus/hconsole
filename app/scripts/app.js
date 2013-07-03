'use strict';

var app = angular.module('hconsoleApp', []).config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/connect.html',
            controller: 'ConnectCtrl'
        })
        .when('/node/:sessionid', {
            templateUrl: 'views/node.html',
            controller: 'NodeCtrl'
        })
        .when('/graph/:sessionid', {
            templateUrl: 'views/graph.html',
            controller: 'GraphCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

app.factory('highcharts', function ($window) {
    $window.Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    return $window.Highcharts;
});

