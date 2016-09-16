angular.module('commonServices', []);
angular.module('common', [
  'ngResource',
  'default',
  'xml',
  'hl7v2-edi',
  'hl7v2',
  'edi',
  'soap',
  'hit-util'
]);
angular.module('main', ['common']);
angular.module('account', ['common']);
angular.module('cf', ['common']);
angular.module('doc', ['common']);
angular.module('cb', ['common']);
angular.module('hit-tool-directives', []);
angular.module('hit-tool-services', ['common']);
angular.module('documentation', []);
var app = angular.module('hit-app', [
    'ngRoute',
    'ui.bootstrap',
    'ngCookies',
    'LocalStorageModule',
    'ngResource',
    'ngSanitize',
    'ngIdle',
    'ngAnimate',
    'ui.bootstrap',
    'ui-notification',
    'angularBootstrapNavTree',
    'QuickList',
    'hit-util',
    'format',
    'default',
    'hl7v2-edi',
    'xml',
    'hl7v2',
    'edi',
    'soap',
    'cf',
    'cb',
    'ngTreetable',
    'blueimp.fileupload',
    'hit-tool-directives',
    'hit-tool-services',
    'commonServices',
    'smart-table',
    'hit-profile-viewer',
    'hit-validation-result',
    'hit-vocab-search',
    'hit-report-viewer',
    'hit-testcase-details',
    'hit-testcase-tree',
    'hit-doc',
    'hit-settings',
    'doc',
    'account',
    'main',
    'hit-manual-report-viewer',
    'ociFixedHeader'
  ]);
var httpHeaders,
  //the message to show on the login popup page
  loginMessage,
  //the spinner used to show when we are still waiting for a server answer
  spinner,
  //The list of messages we don't want to display
  mToHide = [
    'usernameNotFound',
    'emailNotFound',
    'usernameFound',
    'emailFound',
    'loginSuccess',
    'userAdded',
    'uploadImageFailed'
  ];
//the message to be shown to the user
var msg = {};
app.config([
  '$routeProvider',
  '$httpProvider',
  'localStorageServiceProvider',
  'KeepaliveProvider',
  'IdleProvider',
  'NotificationProvider',
  function ($routeProvider, $httpProvider, localStorageServiceProvider, KeepaliveProvider, IdleProvider, NotificationProvider) {
    localStorageServiceProvider.setPrefix('hit-app').setStorageType('sessionStorage');
    $routeProvider.when('/', { templateUrl: 'views/home.html' }).when('/home', { templateUrl: 'views/home.html' }).when('/doc', { templateUrl: 'views/doc.html' }).when('/setting', { templateUrl: 'views/setting.html' }).when('/about', { templateUrl: 'views/about.html' }).when('/cf', { templateUrl: 'views/cf/cf.html' }).when('/cb', { templateUrl: 'views/cb/cb.html' }).when('/error', { templateUrl: 'error.html' }).when('/transport-settings', { templateUrl: 'views/transport-settings.html' }).when('/forgotten', {
      templateUrl: 'views/account/forgotten.html',
      controller: 'ForgottenCtrl'
    }).when('/registration', {
      templateUrl: 'views/account/registration.html',
      controller: 'RegistrationCtrl'
    }).when('/useraccount', { templateUrl: 'views/account/userAccount.html' }).when('/glossary', { templateUrl: 'views/glossary.html' }).when('/resetPassword', {
      templateUrl: 'views/account/registerResetPassword.html',
      controller: 'RegisterResetPasswordCtrl',
      resolve: {
        isFirstSetup: function () {
          return false;
        }
      }
    }).when('/registrationSubmitted', { templateUrl: 'views/account/registrationSubmitted.html' }).otherwise({ redirectTo: '/' });
    $httpProvider.interceptors.push('interceptor1');
    $httpProvider.interceptors.push('interceptor2');
    $httpProvider.interceptors.push('interceptor3');
    $httpProvider.interceptors.push('interceptor4');
    IdleProvider.idle(7200);
    IdleProvider.timeout(30);
    KeepaliveProvider.interval(10);
    // auto hide
    NotificationProvider.setOptions({
      delay: 30000,
      maxCount: 1
    });
    httpHeaders = $httpProvider.defaults.headers;
  }
]);
app.factory('interceptor1', [
  '$q',
  '$rootScope',
  '$location',
  'StorageService',
  '$window',
  function ($q, $rootScope, $location, StorageService, $window) {
    var handle = function (response) {
      console.log('interceptor1');
      if (response.status === 440) {
        response.data = 'Session timeout';
        $rootScope.openSessionExpiredDlg();
      } else if (response.status === 498) {
        response.data = 'Invalid Application State';
        $rootScope.openVersionChangeDlg();
      }  //        else if (response.status === 401) {
         //            $rootScope.openInvalidReqDlg();
         //        }
    };
    return {
      responseError: function (response) {
        handle(response);
        return $q.reject(response);
      }
    };
  }
]);
app.factory('interceptor2', [
  '$q',
  '$rootScope',
  '$location',
  'StorageService',
  '$window',
  function ($q, $rootScope, $location, StorageService, $window) {
    return {
      response: function (response) {
        return response || $q.when(response);
      },
      responseError: function (response) {
        if (response.status === 401) {
          //We catch everything but this one. So public users are not bothered
          //with a login windows when browsing home.
          if (response.config.url !== 'api/accounts/cuser') {
            //We don't intercept this request
            if (response.config.url !== 'api/accounts/login') {
              var deferred = $q.defer(), req = {
                  config: response.config,
                  deferred: deferred
                };
              $rootScope.requests401.push(req);
            }
            $rootScope.$broadcast('event:loginRequired');
            //                        return deferred.promise;
            return $q.when(response);
          }
        }
        return $q.reject(response);
      }
    };
  }
]);
app.factory('interceptor3', [
  '$q',
  '$rootScope',
  '$location',
  'StorageService',
  '$window',
  function ($q, $rootScope, $location, StorageService, $window) {
    return {
      response: function (response) {
        //hide the spinner
        spinner = false;
        return response || $q.when(response);
      },
      responseError: function (response) {
        //hide the spinner
        spinner = false;
        return $q.reject(response);
      }
    };
  }
]);
app.factory('interceptor4', [
  '$q',
  '$rootScope',
  '$location',
  'StorageService',
  '$window',
  function ($q, $rootScope, $location, StorageService, $window) {
    var setMessage = function (response) {
      console.log('interceptor4');
      //if the response has a text and a type property, it is a message to be shown
      if (response.data && response.data.text && response.data.type) {
        if (response.status === 401) {
          //                        console.log("setting login message");
          loginMessage = {
            text: response.data.text,
            type: response.data.type,
            skip: response.data.skip,
            show: true,
            manualHandle: response.data.manualHandle
          };
        } else if (response.status === 503) {
          msg = {
            text: 'server.down',
            type: 'danger',
            show: true,
            manualHandle: true
          };
        } else {
          console.log(response.status);
          msg = {
            text: response.data.text,
            type: response.data.type,
            skip: response.data.skip,
            show: true,
            manualHandle: response.data.manualHandle
          };
          var found = false;
          var i = 0;
          while (i < mToHide.length && !found) {
            if (msg.text === mToHide[i]) {
              found = true;
            }
            i++;
          }
          if (found === true) {
            msg.show = false;
          } else {
          }
        }
      }
    };
    return {
      response: function (response) {
        setMessage(response);
        return response || $q.when(response);
      },
      responseError: function (response) {
        setMessage(response);
        return $q.reject(response);
      }
    };
  }
]);
app.run([
  'Session',
  '$rootScope',
  '$location',
  '$modal',
  'TestingSettings',
  'AppInfo',
  '$q',
  '$sce',
  '$templateCache',
  '$compile',
  'StorageService',
  '$window',
  '$route',
  '$timeout',
  '$http',
  'User',
  'Idle',
  'Transport',
  'IdleService',
  'userInfoService',
  'base64',
  'Notification',
  function (Session, $rootScope, $location, $modal, TestingSettings, AppInfo, $q, $sce, $templateCache, $compile, StorageService, $window, $route, $timeout, $http, User, Idle, Transport, IdleService, userInfoService, base64, Notification) {
    $rootScope.appInfo = {};
    $rootScope.stackPosition = 0;
    $rootScope.transportSupported = false;
    $rootScope.scrollbarWidth = null;
    $rootScope.vcModalInstance = null;
    $rootScope.sessionExpiredModalInstance = null;
    $rootScope.errorModalInstanceInstance = null;
    function getContextPath() {
      return $window.location.pathname.substring(0, $window.location.pathname.indexOf('/', 2));
    }
    var initUser = function (user) {
      userInfoService.setCurrentUser(user);
      User.initUser(user);
      Transport.init();
    };
    AppInfo.get().then(function (appInfo) {
      $rootScope.appInfo = appInfo;
      $rootScope.apiLink = $window.location.protocol + '//' + $window.location.host + getContextPath() + $rootScope.appInfo.apiDocsPath;
      httpHeaders.common['rsbVersion'] = appInfo.rsbVersion;
      var previousToken = StorageService.get(StorageService.APP_STATE_TOKEN);
      if (previousToken != null && previousToken !== appInfo.rsbVersion) {
        $rootScope.openVersionChangeDlg();
      }
      StorageService.set(StorageService.APP_STATE_TOKEN, appInfo.rsbVersion);
    }, function (error) {
      $rootScope.appInfo = {};
      $rootScope.openCriticalErrorDlg('Sorry we could not communicate with the server. Please try again');
    });
    $rootScope.$watch(function () {
      return $location.path();
    }, function (newLocation, oldLocation) {
      //true only for onPopState
      if ($rootScope.activePath === newLocation) {
        var back, historyState = $window.history.state;
        back = !!(historyState && historyState.position <= $rootScope.stackPosition);
        if (back) {
          //back button
          $rootScope.stackPosition--;
        } else {
          //forward button
          $rootScope.stackPosition++;
        }
      } else {
        //normal-way change of page (via link click)
        if ($route.current) {
          $window.history.replaceState({ position: $rootScope.stackPosition }, '');
          $rootScope.stackPosition++;
        }
      }
    });
    $rootScope.isActive = function (path) {
      return path === $rootScope.activePath;
    };
    $rootScope.setActive = function (path) {
      if (path === '' || path === '/') {
        $location.path('/home');
      } else {
        $rootScope.activePath = path;
      }
    };
    $rootScope.isSubActive = function (path) {
      return path === $rootScope.subActivePath;
    };
    $rootScope.setSubActive = function (path) {
      $rootScope.subActivePath = path;
      StorageService.set(StorageService.ACTIVE_SUB_TAB_KEY, path);
    };
    //make current message accessible to root scope and therefore all scopes
    $rootScope.msg = function () {
      return msg;
    };
    //make current loginMessage accessible to root scope and therefore all scopes
    $rootScope.loginMessage = function () {
      //            console.log("calling loginMessage()");
      return loginMessage;
    };
    //showSpinner can be referenced from the view
    $rootScope.showSpinner = function () {
      return spinner;
    };
    $rootScope.createGuestIfNotExist = function () {
      console.log('creating guest user');
      User.createGuestIfNotExist().then(function (guest) {
        initUser(guest);
        console.log('guest user created');
      }, function (error) {
        $rootScope.openCriticalErrorDlg('ERROR: Sorry, Failed to initialize the session. Please refresh the page and try again.');
      });
    };
    /**
     * Holds all the requests which failed due to 401 response.
     */
    $rootScope.requests401 = [];
    $rootScope.$on('event:loginRequired', function () {
      //            console.log("in loginRequired event");
      $rootScope.showLoginDialog();
    });
    /**
     * On 'event:loginConfirmed', resend all the 401 requests.
     */
    $rootScope.$on('event:loginConfirmed', function () {
      initUser(userInfoService.getCurrentUser());
      var i, requests = $rootScope.requests401, retry = function (req) {
          $http(req.config).then(function (response) {
            req.deferred.resolve(response);
          });
        };
      for (i = 0; i < requests.length; i += 1) {
        retry(requests[i]);
      }
      $rootScope.requests401 = [];  //        $window.location.reload();
    });
    /*jshint sub: true */
    /**
     * On 'event:loginRequest' send credentials to the server.
     */
    $rootScope.$on('event:loginRequest', function (event, username, password) {
      httpHeaders.common['Accept'] = 'application/json';
      httpHeaders.common['Authorization'] = 'Basic ' + base64.encode(username + ':' + password);
      //        httpHeaders.common['withCredentials']=true;
      //        httpHeaders.common['Origin']="http://localhost:9000";
      $http.get('api/accounts/login').success(function () {
        //If we are here in this callback, login was successfull
        //Let's get user info now
        httpHeaders.common['Authorization'] = null;
        $http.get('api/accounts/cuser').then(function (result) {
          if (result.data && result.data != null) {
            var rs = angular.fromJson(result.data);
            initUser(rs);
            $rootScope.$broadcast('event:loginConfirmed');
          } else {
            userInfoService.setCurrentUser(null);
          }
        }, function () {
          userInfoService.setCurrentUser(null);
        });
      });
    });
    /**
     * On 'logoutRequest' invoke logout on the server.
     */
    $rootScope.$on('event:logoutRequest', function () {
      httpHeaders.common['Authorization'] = null;
      userInfoService.setCurrentUser(null);
      $http.get('j_spring_security_logout').then(function (result) {
        $rootScope.createGuestIfNotExist();
      });
    });
    /**
     * On 'loginCancel' clears the Authentication header
     */
    $rootScope.$on('event:loginCancel', function () {
      httpHeaders.common['Authorization'] = null;
    });
    $rootScope.$on('$routeChangeStart', function (next, current) {
      //            console.log('route changing');
      // If there is a message while change Route the stop showing the message
      if (msg && msg.manualHandle === 'false') {
        //                console.log('detected msg with text: ' + msg.text);
        msg.show = false;
      }
    });
    $rootScope.$watch(function () {
      return $rootScope.msg().text;
    }, function (value) {
      $rootScope.showNotification($rootScope.msg());
    });
    $rootScope.$watch('language()', function (value) {
      $rootScope.showNotification($rootScope.msg());
    });
    $rootScope.loadFromCookie = function () {
      if (userInfoService.hasCookieInfo() === true) {
        //console.log("found cookie!")
        userInfoService.loadFromCookie();
        httpHeaders.common['Authorization'] = userInfoService.getHthd();
      } else {
      }
    };
    $rootScope.showNotification = function (m) {
      if (m != undefined && m.show && m.text != null) {
        var msg = angular.copy(m);
        var message = $.i18n.prop(msg.text);
        var type = msg.type;
        if (type === 'danger') {
          Notification.error({
            message: message,
            templateUrl: 'NotificationErrorTemplate.html',
            scope: $rootScope,
            delay: 10000
          });
        } else if (type === 'warning') {
          Notification.warning({
            message: message,
            templateUrl: 'NotificationWarningTemplate.html',
            scope: $rootScope,
            delay: 5000
          });
        } else if (type === 'success') {
          Notification.success({
            message: message,
            templateUrl: 'NotificationSuccessTemplate.html',
            scope: $rootScope,
            delay: 5000
          });
        }
        //reset
        m.text = null;
        m.type = null;
        m.show = false;
      }
    };
    $rootScope.getScrollbarWidth = function () {
      if ($rootScope.scrollbarWidth == 0) {
        var outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.msOverflowStyle = 'scrollbar';
        // needed for WinJS apps
        document.body.appendChild(outer);
        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = 'scroll';
        // add innerdiv
        var inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);
        var widthWithScroll = inner.offsetWidth;
        // remove divs
        outer.parentNode.removeChild(outer);
        $rootScope.scrollbarWidth = widthNoScroll - widthWithScroll;
      }
      return $rootScope.scrollbarWidth;
    };
    //loadAppInfo();
    userInfoService.loadFromServer().then(function (currentUser) {
      console.log('currentUser=' + angular.toJson(currentUser));
      if (currentUser !== null && currentUser.id != null && currentUser.id != undefined) {
        initUser(currentUser);
      } else {
        $rootScope.createGuestIfNotExist();
      }
    }, function (error) {
      $rootScope.createGuestIfNotExist();
    });
    $rootScope.getAppInfo = function () {
      return $rootScope.appInfo;
    };
  }
]);
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']).controller('CarouselController', [
  '$scope',
  '$timeout',
  '$transition',
  '$q',
  function ($scope, $timeout, $transition, $q) {
  }
]).directive('carousel', [function () {
    return {};
  }]);
angular.module('hit-tool-services').factory('TabSettings', [
  '$rootScope',
  function ($rootScope) {
    return {
      new: function (key) {
        return {
          key: key,
          activeTab: 0,
          getActiveTab: function () {
            return this.activeTab;
          },
          setActiveTab: function (value) {
            this.activeTab = value;
            this.save();
          },
          save: function () {
            sessionStorage.setItem(this.key, this.activeTab);
          },
          restore: function () {
            this.activeTab = sessionStorage.getItem(this.key) != null && sessionStorage.getItem(this.key) != '' ? parseInt(sessionStorage.getItem(this.key)) : 0;
          }
        };
      }
    };
  }
]);
app.controller('ErrorDetailsCtrl', [
  '$scope',
  '$modalInstance',
  'error',
  function ($scope, $modalInstance, error) {
    $scope.error = error;
    $scope.ok = function () {
      $modalInstance.close($scope.error);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
app.directive('stRatio', function () {
  return {
    link: function (scope, element, attr) {
      var ratio = +attr.stRatio;
      element.css('width', ratio + '%');
    }
  };
});
app.controller('TableFoundCtrl', [
  '$scope',
  '$modalInstance',
  'table',
  function ($scope, $modalInstance, table) {
    $scope.table = table;
    $scope.tmpTableElements = [].concat(table != null ? table.valueSetElements : []);
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
app.controller('ValidationResultInfoCtrl', [
  '$scope',
  '$modalInstance',
  function ($scope, $modalInstance) {
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
app.filter('capitalize', function () {
  return function (input) {
    return !!input ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  };
});
app.controller('ErrorCtrl', [
  '$scope',
  '$modalInstance',
  'StorageService',
  '$window',
  function ($scope, $modalInstance, StorageService, $window) {
    $scope.refresh = function () {
      $modalInstance.close($window.location.reload());
    };
  }
]);
app.controller('FailureCtrl', [
  '$scope',
  '$modalInstance',
  'StorageService',
  '$window',
  'error',
  function ($scope, $modalInstance, StorageService, $window, error) {
    $scope.error = error;
    $scope.close = function () {
      $modalInstance.close();
    };
  }
]);
app.service('base64', function base64() {
  // AngularJS will instantiate a singleton by calling "new" on this function
  var keyStr = 'ABCDEFGHIJKLMNOP' + 'QRSTUVWXYZabcdef' + 'ghijklmnopqrstuv' + 'wxyz0123456789+/' + '=';
  this.encode = function (input) {
    var output = '', chr1, chr2, chr3 = '', enc1, enc2, enc3, enc4 = '', i = 0;
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = '';
      enc1 = enc2 = enc3 = enc4 = '';
    }
    return output;
  };
  this.decode = function (input) {
    var output = '', chr1, chr2, chr3 = '', enc1, enc2, enc3, enc4 = '', i = 0;
    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < input.length) {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));
      chr1 = enc1 << 2 | enc2 >> 4;
      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      chr3 = (enc3 & 3) << 6 | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
      chr1 = chr2 = chr3 = '';
      enc1 = enc2 = enc3 = enc4 = '';
    }
  };
});
app.factory('i18n', function () {
  // AngularJS will instantiate a singleton by calling "new" on this function
  var language;
  var setLanguage = function (theLanguage) {
    $.i18n.properties({
      name: 'messages',
      path: 'lang/',
      mode: 'map',
      language: theLanguage,
      callback: function () {
        language = theLanguage;
      }
    });
  };
  setLanguage('en');
  return { setLanguage: setLanguage };
});
app.factory('Resource', [
  '$resource',
  function ($resource) {
    return function (url, params, methods) {
      var defaults = {
          update: {
            method: 'put',
            isArray: false
          },
          create: { method: 'post' }
        };
      methods = angular.extend(defaults, methods);
      var resource = $resource(url, params, methods);
      resource.prototype.$save = function (successHandler, errorHandler) {
        if (!this.id) {
          return this.$create(successHandler, errorHandler);
        } else {
          return this.$update(successHandler, errorHandler);
        }
      };
      return resource;
    };
  }
]);
/**
 * Created by haffo on 11/20/14.
 */
angular.module('commonServices').factory('StorageService', [
  '$rootScope',
  'localStorageService',
  function ($rootScope, localStorageService) {
    var service = {
        CF_EDITOR_CONTENT_KEY: 'CF_EDITOR_CONTENT',
        CF_LOADED_TESTCASE_ID_KEY: 'CF_LOADED_TESTCASE_ID',
        CF_LOADED_TESTCASE_TYPE_KEY: 'CF_LOADED_TESTCASE_TYPE',
        CB_EDITOR_CONTENT_KEY: 'CB_EDITOR_CONTENT',
        CB_SELECTED_TESTCASE_ID_KEY: 'CB_SELECTED_TESTCASE_ID',
        CB_SELECTED_TESTCASE_TYPE_KEY: 'CB_SELECTED_TESTCASE_TYPE',
        CB_LOADED_TESTCASE_ID_KEY: 'CB_LOADED_TESTCASE_ID',
        CB_LOADED_TESTCASE_TYPE_KEY: 'CB_LOADED_TESTCASE_TYPE',
        CB_LOADED_TESTSTEP_TYPE_KEY: 'CB_LOADED_TESTSTEP_TYPE_KEY',
        CB_LOADED_TESTSTEP_ID_KEY: 'CB_LOADED_TESTSTEP_ID',
        TRANSPORT_CONFIG_KEY: 'TRANSPORT_CONFIG_KEY',
        ACTIVE_SUB_TAB_KEY: 'ACTIVE_SUB_TAB',
        CB_TESTCASE_LOADED_RESULT_MAP_KEY: 'CB_TESTCASE_LOADED_RESULT_MAP_KEY',
        SETTINGS_KEY: 'SETTINGS_KEY',
        USER_KEY: 'USER_KEY',
        USER_CONFIG_KEY: 'USER_CONFIG_KEY',
        TRANSPORT_CONFIG_KEY: 'TRANSPORT_CONFIG_KEY',
        APP_STATE_TOKEN: 'APP_STATE_TOKEN',
        TRANSPORT_DISABLED: 'TRANSPORT_DISABLED',
        TRANSPORT_PROTOCOL: 'TRANSPORT_PROTOCOL',
        remove: function (key) {
          return localStorageService.remove(key);
        },
        removeList: function removeItems(key1, key2, key3) {
          return localStorageService.remove(key1, key2, key3);
        },
        clearAll: function () {
          return localStorageService.clearAll();
        },
        set: function (key, val) {
          return localStorageService.set(key, val);
        },
        get: function (key) {
          return localStorageService.get(key);
        },
        getTransportConfig: function (domain, protocol) {
          return localStorageService.get(domain + '-' + protocol + '-transport-configs');
        },
        setTransportConfig: function (domain, protocol, val) {
          return localStorageService.set(domain + '-' + protocol + '-transport-configs', val);
        }
      };
    return service;
  }
]);
'use strict';
angular.module('cf').factory('CF', [
  '$rootScope',
  '$http',
  '$q',
  'Message',
  'Tree',
  function ($rootScope, $http, $q, Message, Tree) {
    var CF = {
        editor: null,
        cursor: null,
        tree: new Tree(),
        testCase: null,
        selectedTestCase: null,
        message: new Message(),
        searchTableId: 0
      };
    return CF;
  }
]);
angular.module('cf').factory('CFTestCaseListLoader', [
  '$q',
  '$http',
  'StorageService',
  '$timeout',
  function ($q, $http, StorageService, $timeout) {
    return function () {
      var delay = $q.defer();
      $http.get('api/cf/testcases', { timeout: 180000 }).then(function (object) {
        delay.resolve(angular.fromJson(object.data));
      }, function (response) {
        delay.reject(response.data);
      });
      //                $http.get('../../resources/cf/testCases.json').then(
      //                    function (object) {
      //                         delay.resolve(angular.fromJson(object.data));
      //                    },
      //                    function (response) {
      //                        delay.reject(response.data);
      //                    }
      //                );
      return delay.promise;
    };
  }
]);
'use strict';
angular.module('cb').factory('CB', [
  'Message',
  'ValidationSettings',
  'Tree',
  'StorageService',
  'Transport',
  'Logger',
  'User',
  function (Message, ValidationSettings, Tree, StorageService, Transport, Logger, User) {
    var CB = {
        testCase: null,
        selectedTestCase: null,
        editor: null,
        tree: new Tree(),
        cursor: null,
        message: new Message(),
        logger: new Logger(),
        validationSettings: new ValidationSettings(),
        setContent: function (value) {
          CB.message.content = value;
          CB.editor.instance.doc.setValue(value);
          CB.message.notifyChange();
        },
        getContent: function () {
          return CB.message.content;
        }
      };
    return CB;
  }
]);
angular.module('cb').factory('CBTestCaseListLoader', [
  '$q',
  '$http',
  function ($q, $http) {
    return function () {
      var delay = $q.defer();
      $http.get('api/cb/testcases', { timeout: 180000 }).then(function (object) {
        delay.resolve(angular.fromJson(object.data));
      }, function (response) {
        delay.reject(response.data);
      });
      //            $http.get("../../resources/cb/testPlans.json").then(
      //                function (object) {
      //                    delay.resolve(angular.fromJson(object.data));
      //                },
      //                function (response) {
      //                    delay.reject(response.data);
      //                }
      //            );
      return delay.promise;
    };
  }
]);
'use strict';
/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('main').controller('MainService', [
  '$scope',
  function ($scope) {
  }
]);
angular.module('main').factory('TestingSettings', [
  '$rootScope',
  function ($rootScope) {
    var service = {
        activeTab: 0,
        getActiveTab: function () {
          return service.activeTab;
        },
        setActiveTab: function (value) {
          service.activeTab = value;
          service.save();
        },
        save: function () {
          sessionStorage.TestingActiveTab = service.activeTab;
        },
        restore: function () {
          service.activeTab = sessionStorage.TestingActiveTab != null && sessionStorage.TestingActiveTab != '' ? parseInt(sessionStorage.TestingActiveTab) : 0;
        }
      };
    //        $rootScope.$on("TestingSettings:save", service.save);
    //        $rootScope.$on("TestingSettings:restore", service.restore);
    return service;
  }
]);
/**
 * Created by haffo on 4/26/16.
 */
'use strict';
angular.module('account').factory('Account', [
  '$resource',
  function ($resource) {
    return $resource('api/accounts/:id', { id: '@id' });
  }
]);
angular.module('account').factory('LoginService', [
  '$resource',
  '$q',
  function ($resource, $q) {
    return function () {
      var myRes = $resource('api/accounts/login');
      var delay = $q.defer();
      myRes.get({}, function (res) {
        delay.resolve(res);
      });
      return delay.promise;
    };
  }
]);
angular.module('account').factory('AccountLoader', [
  'Account',
  '$q',
  function (Account, $q) {
    return function (acctID) {
      var delay = $q.defer();
      Account.get({ id: acctID }, function (account) {
        delay.resolve(account);
      }, function () {
        delay.reject('Unable to fetch account');
      });
      return delay.promise;
    };
  }
]);
'use strict';
angular.module('account').factory('Testers', [
  '$resource',
  function ($resource) {
    return $resource('api/shortaccounts', { filter: 'accountType::tester' });
  }
]);
angular.module('account').factory('Supervisors', [
  '$resource',
  function ($resource) {
    return $resource('api/shortaccounts', { filter: 'accountType::supervisor' });
  }
]);
angular.module('account').factory('MultiTestersLoader', [
  'Testers',
  '$q',
  function (Testers, $q) {
    return function () {
      var delay = $q.defer();
      Testers.query(function (auth) {
        delay.resolve(auth);
      }, function () {
        delay.reject('Unable to fetch list of testers');
      });
      return delay.promise;
    };
  }
]);
angular.module('account').factory('MultiSupervisorsLoader', [
  'Supervisors',
  '$q',
  function (Supervisors, $q) {
    return function () {
      var delay = $q.defer();
      Supervisors.query(function (res) {
        delay.resolve(res);
      }, function () {
        delay.reject('Unable to fetch list of supervisors');
      });
      return delay.promise;
    };
  }
]);
angular.module('account').factory('userLoaderService', [
  'userInfo',
  '$q',
  function (userInfo, $q) {
    var load = function () {
      var delay = $q.defer();
      userInfo.get({}, function (theUserInfo) {
        delay.resolve(theUserInfo);
      }, function () {
        delay.reject('Unable to fetch user info');
      });
      return delay.promise;
    };
    return { load: load };
  }
]);
'use strict';
angular.module('account').factory('userInfo', [
  '$resource',
  function ($resource) {
    return $resource('api/accounts/cuser');
  }
]);
angular.module('account').factory('userLoaderService', [
  'userInfo',
  '$q',
  function (userInfo, $q) {
    var load = function () {
      var delay = $q.defer();
      userInfo.get({}, function (theUserInfo) {
        delay.resolve(theUserInfo);
      }, function () {
        delay.reject('Unable to fetch user info');
      });
      return delay.promise;
    };
    return { load: load };
  }
]);
angular.module('account').factory('userInfoService', [
  'StorageService',
  'userLoaderService',
  'User',
  'Transport',
  '$q',
  '$timeout',
  function (StorageService, userLoaderService, User, Transport, $q, $timeout) {
    var currentUser = null;
    var supervisor = false, tester = false, admin = false, id = null, username = '', fullName = '';
    //console.log("USER ID=", StorageService.get('userID'));
    var loadFromCookie = function () {
      //console.log("UserID=", StorageService.get('userID'));
      id = StorageService.get('userID');
      username = StorageService.get('username');
      tester = StorageService.get('tester');
      supervisor = StorageService.get('supervisor');
      admin = StorageService.get('admin');
    };
    var saveToCookie = function () {
      StorageService.set('accountID', id);
      StorageService.set('username', username);
      StorageService.set('tester', tester);
      StorageService.set('supervisor', supervisor);
      StorageService.set('admin', admin);
      StorageService.set('fullName', fullName);
    };
    var clearCookie = function () {
      StorageService.remove('accountID');
      StorageService.remove('username');
      StorageService.remove('tester');
      StorageService.remove('supervisor');
      StorageService.remove('admin');
      StorageService.remove('hthd');
      StorageService.remove('fullName');
    };
    var saveHthd = function (header) {
      StorageService.set('hthd', header);
    };
    var getHthd = function (header) {
      return StorageService.get('hthd');
    };
    var hasCookieInfo = function () {
      if (StorageService.get('username') === '') {
        return false;
      } else {
        return true;
      }
    };
    var getAccountID = function () {
      if (isAuthenticated()) {
        return currentUser.accountId.toString();
      }
      return '0';
    };
    var isAdmin = function () {
      return admin;
    };
    var isTester = function () {
      return tester;
    };
    //        var isAuthorizedVendor = function() {
    //            return authorizedVendor;
    //        };
    //
    //        var isCustomer = function() {
    //            return (author || authorizedVendor);
    //        };
    var isSupervisor = function () {
      return supervisor;
    };
    var isPending = function () {
      return isAuthenticated() && currentUser != null ? currentUser.pending : false;
    };
    var isAuthenticated = function () {
      var res = currentUser !== undefined && currentUser != null && currentUser.authenticated === true;
      return res;  //            return true;
    };
    var loadFromServer = function () {
      if (!isAuthenticated()) {
        return userLoaderService.load();
      } else {
        var delay = $q.defer();
        $timeout(function () {
          delay.resolve(currentUser);
        });
        return delay.promise;
      }
    };
    var getCurrentUser = function () {
      return currentUser;
    };
    var setCurrentUser = function (newUser) {
      currentUser = newUser;
      if (currentUser !== null && currentUser !== undefined) {
        username = currentUser.username;
        id = currentUser.accountId;
        fullName = currentUser.fullName;
        if (angular.isArray(currentUser.authorities)) {
          angular.forEach(currentUser.authorities, function (value, key) {
            switch (value.authority) {
            case 'user':
              break;
            case 'admin':
              admin = true;
              break;
            case 'tester':
              tester = true;
              break;
            case 'supervisor':
              supervisor = true;
              break;
            default:
            }
          });
        }  //saveToCookie();
      } else {
        supervisor = false;
        tester = false;
        admin = false;
        username = '';
        id = null;
        fullName = '';  //clearCookie();
      }
    };
    var getUsername = function () {
      return username;
    };
    var getFullName = function () {
      return fullName;
    };
    return {
      saveHthd: saveHthd,
      getHthd: getHthd,
      hasCookieInfo: hasCookieInfo,
      loadFromCookie: loadFromCookie,
      getAccountID: getAccountID,
      isAdmin: isAdmin,
      isTester: isTester,
      isAuthenticated: isAuthenticated,
      isPending: isPending,
      isSupervisor: isSupervisor,
      setCurrentUser: setCurrentUser,
      getCurrentUser: getCurrentUser,
      loadFromServer: loadFromServer,
      getUsername: getUsername,
      getFullName: getFullName
    };
  }
]);
'use strict';
angular.module('main').controller('MainCtrl', [
  '$scope',
  '$rootScope',
  'i18n',
  '$location',
  'userInfoService',
  '$modal',
  '$filter',
  'base64',
  '$http',
  'Idle',
  'Notification',
  'IdleService',
  'StorageService',
  'TestingSettings',
  'Session',
  'AppInfo',
  'User',
  '$templateCache',
  '$window',
  '$sce',
  function ($scope, $rootScope, i18n, $location, userInfoService, $modal, $filter, base64, $http, Idle, Notification, IdleService, StorageService, TestingSettings, Session, AppInfo, User, $templateCache, $window, $sce) {
    //This line fetches the info from the server if the user is currently logged in.
    //If success, the app is updated according to the role.
    $rootScope.loginDialog = null;
    $rootScope.started = false;
    $scope.language = function () {
      return i18n.language;
    };
    $scope.setLanguage = function (lang) {
      i18n.setLanguage(lang);
    };
    $scope.activeWhen = function (value) {
      return value ? 'active' : '';
    };
    $scope.activeIfInList = function (value, pathsList) {
      var found = false;
      if (angular.isArray(pathsList) === false) {
        return '';
      }
      var i = 0;
      while (i < pathsList.length && found === false) {
        if (pathsList[i] === value) {
          return 'active';
        }
        i++;
      }
      return '';
    };
    $scope.path = function () {
      return $location.url();
    };
    $scope.login = function () {
      $scope.$emit('event:loginRequest', $scope.username, $scope.password);
    };
    $scope.loginReq = function () {
      if ($rootScope.loginMessage()) {
        $rootScope.loginMessage().text = '';
        $rootScope.loginMessage().show = false;
      }
      $scope.$emit('event:loginRequired');
    };
    $scope.logout = function () {
      $scope.execLogout();
    };
    $scope.execLogout = function () {
      userInfoService.setCurrentUser(null);
      $scope.username = $scope.password = null;
      $scope.$emit('event:logoutRequest');
      $location.url('/home');
    };
    $scope.cancel = function () {
      $scope.$emit('event:loginCancel');
    };
    $scope.isAuthenticated = function () {
      return userInfoService.isAuthenticated();
    };
    $scope.isPending = function () {
      return userInfoService.isPending();
    };
    $scope.isSupervisor = function () {
      return userInfoService.isSupervisor();
    };
    $scope.isTester = function () {
      return userInfoService.isTester();
    };
    $scope.isAdmin = function () {
      return userInfoService.isAdmin();
    };
    $scope.getRoleAsString = function () {
      if ($scope.isTester() === true) {
        return 'tester';
      }
      if ($scope.isSupervisor() === true) {
        return 'Supervisor';
      }
      if ($scope.isAdmin() === true) {
        return 'Admin';
      }
      return 'undefined';
    };
    $scope.getUsername = function () {
      if (userInfoService.isAuthenticated() === true) {
        return userInfoService.getUsername();
      }
      return '';
    };
    $rootScope.showLoginDialog = function (username, password) {
      if ($rootScope.loginDialog && $rootScope.loginDialog != null && $rootScope.loginDialog.opened) {
        $rootScope.loginDialog.dismiss('cancel');
      }
      $rootScope.loginDialog = $modal.open({
        backdrop: 'static',
        keyboard: 'false',
        controller: 'LoginCtrl',
        size: 'lg',
        templateUrl: 'views/account/login.html',
        resolve: {
          user: function () {
            return {
              username: $scope.username,
              password: $scope.password
            };
          }
        }
      });
      $rootScope.loginDialog.result.then(function (result) {
        if (result) {
          $scope.username = result.username;
          $scope.password = result.password;
          $scope.login();
        } else {
          $scope.cancel();
        }
      });
    };
    $rootScope.started = false;
    Idle.watch();
    $rootScope.$on('IdleStart', function () {
      closeModals();
      $rootScope.warning = $modal.open({
        templateUrl: 'warning-dialog.html',
        windowClass: 'modal-danger'
      });
    });
    $rootScope.$on('IdleEnd', function () {
      closeModals();
    });
    $rootScope.$on('IdleTimeout', function () {
      closeModals();
      if ($scope.isAuthenticated()) {
        $rootScope.$emit('event:execLogout');
        $rootScope.timedout = $modal.open({
          templateUrl: 'timedout-dialog.html',
          windowClass: 'modal-danger'
        });
      } else {
        StorageService.clearAll();
        Session.delete().then(function (response) {
          $rootScope.timedout = $modal.open({
            templateUrl: 'timedout-dialog.html',
            windowClass: 'modal-danger',
            backdrop: true,
            keyboard: 'false',
            controller: 'FailureCtrl',
            resolve: {
              error: function () {
                return '';
              }
            }
          });
          $rootScope.timedout.result.then(function () {
            $rootScope.clearTemplate();
            $rootScope.reloadPage();
          }, function () {
            $rootScope.clearTemplate();
            $rootScope.reloadPage();
          });
        });
      }
    });
    $scope.$on('Keepalive', function () {
      if ($scope.isAuthenticated()) {
        IdleService.keepAlive();
      }
    });
    $rootScope.$on('Keepalive', function () {
      IdleService.keepAlive();
    });
    $rootScope.$on('event:execLogout', function () {
      $scope.execLogout();
    });
    function closeModals() {
      if ($rootScope.warning) {
        $rootScope.warning.close();
        $rootScope.warning = null;
      }
      if ($rootScope.timedout) {
        $rootScope.timedout.close();
        $rootScope.timedout = null;
      }
    }
    ;
    $rootScope.start = function () {
      closeModals();
      Idle.watch();
      $rootScope.started = true;
    };
    $rootScope.stop = function () {
      closeModals();
      Idle.unwatch();
      $rootScope.started = false;
    };
    $scope.checkForIE = function () {
      var BrowserDetect = {
          init: function () {
            this.browser = this.searchString(this.dataBrowser) || 'An unknown browser';
            this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'an unknown version';
            this.OS = this.searchString(this.dataOS) || 'an unknown OS';
          },
          searchString: function (data) {
            for (var i = 0; i < data.length; i++) {
              var dataString = data[i].string;
              var dataProp = data[i].prop;
              this.versionSearchString = data[i].versionSearch || data[i].identity;
              if (dataString) {
                if (dataString.indexOf(data[i].subString) !== -1) {
                  return data[i].identity;
                }
              } else if (dataProp) {
                return data[i].identity;
              }
            }
          },
          searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index === -1) {
              return;
            }
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
          },
          dataBrowser: [
            {
              string: navigator.userAgent,
              subString: 'Chrome',
              identity: 'Chrome'
            },
            {
              string: navigator.userAgent,
              subString: 'OmniWeb',
              versionSearch: 'OmniWeb/',
              identity: 'OmniWeb'
            },
            {
              string: navigator.vendor,
              subString: 'Apple',
              identity: 'Safari',
              versionSearch: 'Version'
            },
            {
              prop: window.opera,
              identity: 'Opera',
              versionSearch: 'Version'
            },
            {
              string: navigator.vendor,
              subString: 'iCab',
              identity: 'iCab'
            },
            {
              string: navigator.vendor,
              subString: 'KDE',
              identity: 'Konqueror'
            },
            {
              string: navigator.userAgent,
              subString: 'Firefox',
              identity: 'Firefox'
            },
            {
              string: navigator.vendor,
              subString: 'Camino',
              identity: 'Camino'
            },
            {
              string: navigator.userAgent,
              subString: 'Netscape',
              identity: 'Netscape'
            },
            {
              string: navigator.userAgent,
              subString: 'MSIE',
              identity: 'Explorer',
              versionSearch: 'MSIE'
            },
            {
              string: navigator.userAgent,
              subString: 'Gecko',
              identity: 'Mozilla',
              versionSearch: 'rv'
            },
            {
              string: navigator.userAgent,
              subString: 'Mozilla',
              identity: 'Netscape',
              versionSearch: 'Mozilla'
            }
          ],
          dataOS: [
            {
              string: navigator.platform,
              subString: 'Win',
              identity: 'Windows'
            },
            {
              string: navigator.platform,
              subString: 'Mac',
              identity: 'Mac'
            },
            {
              string: navigator.userAgent,
              subString: 'iPhone',
              identity: 'iPhone/iPod'
            },
            {
              string: navigator.platform,
              subString: 'Linux',
              identity: 'Linux'
            }
          ]
        };
      BrowserDetect.init();
      if (BrowserDetect.browser === 'Explorer') {
        var title = 'You are using Internet Explorer';
        var msg = 'This site is not yet optimized with Internet Explorer. For the best user experience, please use Chrome, Firefox or Safari. Thank you for your patience.';
        var btns = [{
              result: 'ok',
              label: 'OK',
              cssClass: 'btn'
            }];  //$dialog.messageBox(title, msg, btns).open();
      }
    };
    $rootScope.readonly = false;
    $scope.scrollbarWidth = 0;
    $rootScope.showError = function (error) {
      var modalInstance = $modal.open({
          templateUrl: 'ErrorDlgDetails.html',
          controller: 'ErrorDetailsCtrl',
          resolve: {
            error: function () {
              return error;
            }
          }
        });
      modalInstance.result.then(function (error) {
        $rootScope.error = error;
      }, function () {
      });
    };
    $rootScope.openRichTextDlg = function (obj, key, title, disabled) {
      var modalInstance = $modal.open({
          templateUrl: 'RichTextCtrl.html',
          controller: 'RichTextCtrl',
          windowClass: 'app-modal-window',
          backdrop: true,
          keyboard: true,
          backdropClick: false,
          resolve: {
            editorTarget: function () {
              return {
                key: key,
                obj: obj,
                disabled: disabled,
                title: title
              };
            }
          }
        });
    };
    $rootScope.openInputTextDlg = function (obj, key, title, disabled) {
      var modalInstance = $modal.open({
          templateUrl: 'InputTextCtrl.html',
          controller: 'InputTextCtrl',
          backdrop: true,
          keyboard: true,
          windowClass: 'app-modal-window',
          backdropClick: false,
          resolve: {
            editorTarget: function () {
              return {
                key: key,
                obj: obj,
                disabled: disabled,
                title: title
              };
            }
          }
        });
    };
    $rootScope.showError = function (error) {
      var modalInstance = $modal.open({
          templateUrl: 'ErrorDlgDetails.html',
          controller: 'ErrorDetailsCtrl',
          resolve: {
            error: function () {
              return error;
            }
          }
        });
      modalInstance.result.then(function (error) {
        $rootScope.error = error;
      }, function () {
      });
    };
    $rootScope.cutString = function (str) {
      if (str.length > 20)
        str = str.substring(0, 20) + '...';
      return str;
    };
    $rootScope.toHTML = function (content) {
      return $sce.trustAsHtml(content);  //return  content;
    };
    $rootScope.selectTestingType = function (value) {
      $rootScope.tabs[0] = false;
      $rootScope.tabs[1] = false;
      $rootScope.tabs[2] = false;
      $rootScope.tabs[3] = false;
      $rootScope.tabs[4] = false;
      $rootScope.tabs[5] = false;
      $rootScope.activeTab = value;
      $rootScope.tabs[$rootScope.activeTab] = true;
      TestingSettings.setActiveTab($rootScope.activeTab);
    };
    $rootScope.downloadArtifact = function (path) {
      var form = document.createElement('form');
      form.action = 'api/artifact/download';
      form.method = 'POST';
      form.target = '_target';
      var input = document.createElement('input');
      input.name = 'path';
      input.value = path;
      form.appendChild(input);
      form.style.display = 'none';
      document.body.appendChild(form);
      form.submit();
    };
    $rootScope.tabs = new Array();
    $rootScope.compile = function (content) {
      return $compile(content);
    };
    $rootScope.$on('$locationChangeSuccess', function () {
      $rootScope.setActive($location.path());
    });
    $rootScope.openValidationResultInfo = function () {
      var modalInstance = $modal.open({
          templateUrl: 'ValidationResultInfoCtrl.html',
          windowClass: 'profile-modal',
          controller: 'ValidationResultInfoCtrl'
        });
    };
    $rootScope.openVersionChangeDlg = function () {
      StorageService.clearAll();
      if (!$rootScope.vcModalInstance || $rootScope.vcModalInstance === null || !$rootScope.vcModalInstance.opened) {
        $rootScope.vcModalInstance = $modal.open({
          templateUrl: 'VersionChanged.html',
          size: 'lg',
          backdrop: 'static',
          keyboard: 'false',
          'controller': 'FailureCtrl',
          resolve: {
            error: function () {
              return '';
            }
          }
        });
        $rootScope.vcModalInstance.result.then(function () {
          $rootScope.clearTemplate();
          $rootScope.reloadPage();
        }, function () {
          $rootScope.clearTemplate();
          $rootScope.reloadPage();
        });
      }
    };
    $rootScope.openCriticalErrorDlg = function (errorMessage) {
      StorageService.clearAll();
      if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
        $rootScope.errorModalInstance = $modal.open({
          templateUrl: 'CriticalError.html',
          size: 'lg',
          backdrop: true,
          keyboard: 'true',
          'controller': 'FailureCtrl',
          resolve: {
            error: function () {
              return errorMessage;
            }
          }
        });
        $rootScope.errorModalInstance.result.then(function () {
          $rootScope.clearTemplate();
          $rootScope.reloadPage();
        }, function () {
          $rootScope.clearTemplate();
          $rootScope.reloadPage();
        });
      }
    };
    $rootScope.openSessionExpiredDlg = function () {
      StorageService.clearAll();
      if (!$rootScope.sessionExpiredModalInstance || $rootScope.sessionExpiredModalInstance === null || !$rootScope.sessionExpiredModalInstance.opened) {
        $rootScope.sessionExpiredModalInstance = $modal.open({
          templateUrl: 'timedout-dialog.html',
          size: 'lg',
          backdrop: true,
          keyboard: 'true',
          'controller': 'FailureCtrl',
          resolve: {
            error: function () {
              return '';
            }
          }
        });
        $rootScope.sessionExpiredModalInstance.result.then(function () {
          $rootScope.clearTemplate();
          $rootScope.reloadPage();
        }, function () {
          $rootScope.clearTemplate();
          $rootScope.reloadPage();
        });
      }
    };
    $rootScope.clearTemplate = function () {
      $templateCache.removeAll();
    };
    $rootScope.openErrorDlg = function () {
      $location.path('/error');
    };
    $rootScope.pettyPrintType = function (type) {
      return type === 'TestStep' ? 'Test Step' : type === 'TestCase' ? 'Test Case' : type;
    };
    $rootScope.reloadPage = function () {
      $window.location.reload();
    };
    $rootScope.openInvalidReqDlg = function () {
      if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
        $rootScope.errorModalInstance = $modal.open({
          templateUrl: 'InvalidReqCtrl.html',
          size: 'lg',
          backdrop: true,
          keyboard: 'false',
          'controller': 'FailureCtrl',
          resolve: {
            error: function () {
              return '';
            }
          }
        });
        $rootScope.errorModalInstance.result.then(function () {
          $rootScope.reloadPage();
        }, function () {
          $rootScope.reloadPage();
        });
      }
    };
    $rootScope.openNotFoundDlg = function () {
      if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
        $rootScope.errorModalInstance = $modal.open({
          templateUrl: 'NotFoundCtrl.html',
          size: 'lg',
          backdrop: true,
          keyboard: 'false',
          'controller': 'FailureCtrl',
          resolve: {
            error: function () {
              return '';
            }
          }
        });
        $rootScope.errorModalInstance.result.then(function () {
          $rootScope.reloadPage();
        }, function () {
          $rootScope.reloadPage();
        });
      }
    };
    $rootScope.nav = function (target) {
      $location.path(target);
    };
    $rootScope.showSettings = function () {
      var modalInstance = $modal.open({
          templateUrl: 'SettingsCtrl.html',
          size: 'lg',
          keyboard: 'false',
          controller: 'SettingsCtrl'
        });
    };
    $scope.init = function () {
    };
    $scope.getFullName = function () {
      if (userInfoService.isAuthenticated() === true) {
        return userInfoService.getFullName();
      }
      return '';
    };
  }
]);
angular.module('main').controller('LoginCtrl', [
  '$scope',
  '$modalInstance',
  'user',
  function ($scope, $modalInstance, user) {
    $scope.user = user;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.login = function () {
      //        console.log("logging in...");
      $modalInstance.close($scope.user);
    };
  }
]);
angular.module('main').controller('RichTextCtrl', [
  '$scope',
  '$modalInstance',
  'editorTarget',
  function ($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.close = function () {
      $modalInstance.close($scope.editorTarget);
    };
  }
]);
angular.module('main').controller('InputTextCtrl', [
  '$scope',
  '$modalInstance',
  'editorTarget',
  function ($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.close = function () {
      $modalInstance.close($scope.editorTarget);
    };
  }
]);
angular.module('main').controller('ConfirmLogoutCtrl', [
  '$scope',
  '$modalInstance',
  '$rootScope',
  '$http',
  function ($scope, $modalInstance, $rootScope, $http) {
    $scope.logout = function () {
      $modalInstance.close();
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
angular.module('main').controller('MessageWithHexadecimalDlgCtrl', [
  '$scope',
  '$modalInstance',
  'original',
  'MessageUtil',
  function ($scope, $modalInstance, original, MessageUtil) {
    $scope.showHex = true;
    var messageWithHexadecimal = MessageUtil.toHexadecimal(original);
    $scope.message = messageWithHexadecimal;
    $scope.toggleHexadecimal = function () {
      $scope.showHex = !$scope.showHex;
      $scope.message = $scope.showHex ? messageWithHexadecimal : original;
    };
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
angular.module('main').controller('ValidationResultDetailsCtrl', [
  '$scope',
  '$modalInstance',
  'selectedElement',
  function ($scope, $modalInstance, selectedElement) {
    $scope.selectedElement = selectedElement;
    $scope.ok = function () {
      $modalInstance.close($scope.selectedElement);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
'use strict';
angular.module('cf').controller('CFTestingCtrl', [
  '$scope',
  '$http',
  'CF',
  '$window',
  '$modal',
  '$filter',
  '$rootScope',
  'CFTestCaseListLoader',
  '$timeout',
  'StorageService',
  'TestCaseService',
  'TestStepService',
  function ($scope, $http, CF, $window, $modal, $filter, $rootScope, CFTestCaseListLoader, $timeout, StorageService, TestCaseService, TestStepService) {
    $scope.cf = CF;
    $scope.loading = false;
    $scope.loadingTC = false;
    $scope.error = null;
    $scope.testCases = [];
    $scope.testCase = null;
    $scope.tree = {};
    $scope.tabs = new Array();
    $scope.error = null;
    $scope.collapsed = false;
    var testCaseService = new TestCaseService();
    $scope.setActiveTab = function (value) {
      $scope.tabs[0] = false;
      $scope.tabs[1] = false;
      $scope.tabs[2] = false;
      $scope.tabs[3] = false;
      $scope.activeTab = value;
      $scope.tabs[$scope.activeTab] = true;
    };
    $scope.getTestCaseDisplayName = function (testCase) {
      return testCase.parentName + ' - ' + testCase.label;
    };
    $scope.selectTestCase = function (testCase) {
      $scope.loadingTC = true;
      $timeout(function () {
        var previousId = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
        if (previousId != null)
          TestStepService.clearRecords(previousId);
        if (testCase.testContext && testCase.testContext != null) {
          CF.testCase = testCase;
          $scope.testCase = CF.testCase;
          var id = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
          if (id != testCase.id) {
            StorageService.set(StorageService.CF_LOADED_TESTCASE_ID_KEY, testCase.id);
            StorageService.remove(StorageService.CF_EDITOR_CONTENT_KEY);
          }
          $scope.$broadcast('cf:testCaseLoaded', $scope.testCase);
          $scope.$broadcast('cf:profileLoaded', $scope.testCase.testContext.profile);
          $scope.$broadcast('cf:valueSetLibraryLoaded', $scope.testCase.testContext.vocabularyLibrary);
        }
        $scope.loadingTC = false;
      });
    };
    $scope.refreshTree = function () {
      $timeout(function () {
        if ($scope.testCases != null) {
          if (typeof $scope.tree.build_all == 'function') {
            $scope.tree.build_all($scope.testCases);
            var testCase = null;
            var id = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
            if (id != null) {
              for (var i = 0; i < $scope.testCases.length; i++) {
                var found = testCaseService.findOneById(id, $scope.testCases[i]);
                if (found != null) {
                  testCase = found;
                  break;
                }
              }
            }
            if (testCase != null) {
              $scope.selectNode(testCase.id, testCase.type);
            }
            $scope.expandAll();
            $scope.error = null;
          } else {
            $scope.error = 'Ooops, Something went wrong. Please refresh your page again.';
          }
        }
        $scope.loading = false;
      }, 1000);
    };
    $scope.initTesting = function () {
      StorageService.remove(StorageService.ACTIVE_SUB_TAB_KEY);
      $scope.error = null;
      $scope.testCases = [];
      $scope.loading = true;
      var tcLoader = new CFTestCaseListLoader();
      tcLoader.then(function (testCases) {
        angular.forEach(testCases, function (testPlan) {
          testCaseService.buildCFTestCases(testPlan);
        });
        $scope.testCases = $filter('orderBy')(testCases, 'position');
        $scope.refreshTree();
      }, function (error) {
        $scope.error = 'Sorry, Cannot load the profiles. Try again';
        $scope.loading = false;
      });
      $scope.$on('$destroy', function () {
        var testStepId = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
        if (testStepId != null)
          TestStepService.clearRecords(testStepId);
      });
    };
    $scope.selectNode = function (id, type) {
      $timeout(function () {
        testCaseService.selectNodeByIdAndType($scope.tree, id, type);
      }, 0);
    };
    $scope.openProfileInfo = function () {
      var modalInstance = $modal.open({
          templateUrl: 'CFProfileInfoCtrl.html',
          windowClass: 'profile-modal',
          controller: 'CFProfileInfoCtrl'
        });
    };
    $scope.isSelectable = function (node) {
      return node.testContext && node.testContext != null;
    };
    $scope.expandAll = function () {
      if ($scope.tree != null)
        $scope.tree.expand_all();
    };
    $scope.collapseAll = function () {
      if ($scope.tree != null)
        $scope.tree.collapse_all();
    };
  }
]);
angular.module('cf').controller('CFProfileInfoCtrl', [
  '$scope',
  '$modalInstance',
  function ($scope, $modalInstance) {
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
angular.module('cf').controller('CFValidatorCtrl', [
  '$scope',
  '$http',
  'CF',
  '$window',
  '$timeout',
  '$modal',
  'NewValidationResult',
  '$rootScope',
  'ServiceDelegator',
  'StorageService',
  'TestStepService',
  'MessageUtil',
  function ($scope, $http, CF, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, TestStepService, MessageUtil) {
    $scope.cf = CF;
    $scope.testCase = CF.testCase;
    $scope.message = CF.message;
    $scope.selectedMessage = {};
    $scope.loading = true;
    $scope.error = null;
    $scope.vError = null;
    $scope.vLoading = true;
    $scope.mError = null;
    $scope.mLoading = true;
    $scope.delimeters = [];
    $scope.counter = 0;
    $scope.type = 'cf';
    $scope.loadRate = 4000;
    $scope.tokenPromise = null;
    $scope.editorInit = false;
    $scope.nodelay = false;
    $scope.resized = false;
    $scope.selectedItem = null;
    $scope.activeTab = 0;
    $scope.tError = null;
    $scope.tLoading = false;
    $scope.hasNonPrintable = false;
    $scope.dqaCodes = StorageService.get(StorageService.DQA_OPTIONS_KEY) != null ? angular.fromJson(StorageService.get(StorageService.DQA_OPTIONS_KEY)) : [];
    $scope.showDQAOptions = function () {
      var modalInstance = $modal.open({
          templateUrl: 'DQAConfig.html',
          controller: 'DQAConfigCtrl',
          windowClass: 'dq-modal',
          animation: true,
          keyboard: false,
          backdrop: false
        });
      modalInstance.result.then(function (selectedCodes) {
        $scope.dqaCodes = selectedCodes;
      }, function () {
      });
    };
    $scope.hasContent = function () {
      return $scope.cf.message.content != '' && $scope.cf.message.content != null;
    };
    $scope.refreshEditor = function () {
      $timeout(function () {
        if ($scope.editor)
          $scope.editor.refresh();
      }, 1000);
    };
    $scope.options = {
      paramName: 'file',
      formAcceptCharset: 'utf-8',
      autoUpload: true,
      type: 'POST'
    };
    $scope.$on('fileuploadadd', function (e, data) {
      if (data.autoUpload || data.autoUpload !== false && $(this).fileupload('option', 'autoUpload')) {
        data.process().done(function () {
          var fileName = data.files[0].name;
          data.url = 'api/message/upload';
          var jqXHR = data.submit().success(function (result, textStatus, jqXHR) {
              $scope.nodelay = true;
              var tmp = angular.fromJson(result);
              $scope.cf.message.name = fileName;
              $scope.cf.editor.instance.doc.setValue(tmp.content);
              $scope.mError = null;
              $scope.execute();
            }).error(function (jqXHR, textStatus, errorThrown) {
              $scope.cf.message.name = fileName;
              $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ', Error: ' + errorThrown;
            }).complete(function (result, textStatus, jqXHR) {
            });
        });
      }
    });
    $scope.loadMessage = function () {
      if ($scope.cf.testCase.testContext.message && $scope.cf.testCase.testContext.message != null) {
        $scope.nodelay = true;
        $scope.selectedMessage = $scope.cf.testCase.testContext.message;
        if ($scope.selectedMessage != null && $scope.selectedMessage.content != null) {
          $scope.editor.doc.setValue($scope.selectedMessage.content);
        } else {
          $scope.editor.doc.setValue('');
          $scope.cf.message.id = null;
          $scope.cf.message.name = '';
        }
        $scope.execute();
      }
    };
    $scope.setLoadRate = function (value) {
      $scope.loadRate = value;
    };
    $scope.initCodemirror = function () {
      $scope.editor = CodeMirror.fromTextArea(document.getElementById('cfTextArea'), {
        lineNumbers: true,
        fixedGutter: true,
        theme: 'elegant',
        readOnly: false,
        showCursorWhenSelecting: true,
        gutters: [
          'CodeMirror-linenumbers',
          'cm-edi-segment-name'
        ]
      });
      $scope.editor.setSize('100%', 345);
      $scope.editor.on('keyup', function () {
        $timeout(function () {
          var msg = $scope.editor.doc.getValue();
          $scope.error = null;
          if ($scope.tokenPromise) {
            $timeout.cancel($scope.tokenPromise);
            $scope.tokenPromise = undefined;
          }
          CF.message.name = null;
          if (msg.trim() !== '') {
            $scope.tokenPromise = $timeout(function () {
              $scope.execute();
            }, $scope.loadRate);
          } else {
            $scope.execute();
          }
        });
      });
      $scope.editor.on('dblclick', function (editor) {
        $timeout(function () {
          var coordinate = ServiceDelegator.getCursorService($scope.testCase.testContext.format).getCoordinate($scope.editor, $scope.cf.tree);
          coordinate.lineNumber = coordinate.line;
          coordinate.startIndex = coordinate.startIndex + 1;
          coordinate.endIndex = coordinate.endIndex + 1;
          $scope.cf.cursor.init(coordinate, true);
          ServiceDelegator.getTreeService($scope.testCase.testContext.format).selectNodeByIndex($scope.cf.tree.root, CF.cursor, CF.message.content);
        });
      });
    };
    /**
         * Validate the content of the editor
         */
    $scope.validateMessage = function () {
      try {
        $scope.vLoading = true;
        $scope.vError = null;
        if ($scope.cf.testCase != null && $scope.cf.message.content !== '') {
          var id = $scope.cf.testCase.testContext.id;
          var content = $scope.cf.message.content;
          var label = $scope.cf.testCase.label;
          var validated = ServiceDelegator.getMessageValidator($scope.testCase.testContext.format).validate(id, content, null, 'Free', $scope.cf.testCase.testContext.dqa === true ? $scope.dqaCodes : [], '1223');
          validated.then(function (mvResult) {
            $scope.vLoading = false;
            $scope.loadValidationResult(mvResult);
          }, function (error) {
            $scope.vLoading = false;
            $scope.vError = error;
            $scope.loadValidationResult(null);
          });
        } else {
          $scope.loadValidationResult(null);
          $scope.vLoading = false;
          $scope.vError = null;
        }
      } catch (error) {
        $scope.vLoading = false;
        $scope.vError = error;
        $scope.loadValidationResult(null);
      }
    };
    $scope.loadValidationResult = function (mvResult) {
      $timeout(function () {
        $rootScope.$emit('cf:validationResultLoaded', mvResult, $scope.cf.testCase);
      });
    };
    $scope.select = function (element) {
      if (element != undefined && element.path != null && element.line != -1) {
        var node = ServiceDelegator.getTreeService($scope.testCase.testContext.format).selectNodeByPath($scope.cf.tree.root, element.line, element.path);
        var data = node != null ? node.data : null;
        $scope.cf.cursor.init(data != null ? data.lineNumber : element.line, data != null ? data.startIndex - 1 : element.column - 1, data != null ? data.endIndex - 1 : element.column - 1, data != null ? data.startIndex - 1 : element.column - 1, false);
        ServiceDelegator.getEditorService($scope.testCase.testContext.format).select($scope.editor, $scope.cf.cursor);
      }
    };
    $scope.clearMessage = function () {
      $scope.nodelay = true;
      $scope.mError = null;
      if ($scope.editor) {
        $scope.editor.doc.setValue('');
        $scope.execute();
      }
    };
    $scope.saveMessage = function () {
      $scope.cf.message.download();
    };
    $scope.parseMessage = function () {
      try {
        if ($scope.cf.testCase != null && $scope.cf.testCase.testContext != null && $scope.cf.message.content != '') {
          $scope.tLoading = true;
          var parsed = ServiceDelegator.getMessageParser($scope.testCase.testContext.format).parse($scope.cf.testCase.testContext.id, $scope.cf.message.content);
          parsed.then(function (value) {
            $scope.tLoading = false;
            $scope.cf.tree.root.build_all(value.elements);
            ServiceDelegator.updateEditorMode($scope.editor, value.delimeters, $scope.cf.testCase.testContext.format);
            ServiceDelegator.getEditorService($scope.testCase.testContext.format).setEditor($scope.editor);
            ServiceDelegator.getTreeService($scope.testCase.testContext.format).setEditor($scope.editor);
          }, function (error) {
            $scope.tLoading = false;
            $scope.tError = error;
          });
        } else {
          if (typeof $scope.cf.tree.root.build_all == 'function') {
            $scope.cf.tree.root.build_all([]);
          }
          $scope.tError = null;
          $scope.tLoading = false;
        }
      } catch (error) {
        $scope.tLoading = false;
        $scope.tError = error;
      }
    };
    $scope.onNodeSelect = function (node) {
      ServiceDelegator.getTreeService($scope.testCase.testContext.format).getEndIndex(node, $scope.cf.message.content);
      $scope.cf.cursor.init(node.data, false);
      ServiceDelegator.getEditorService($scope.testCase.testContext.format).select($scope.editor, $scope.cf.cursor);
    };
    $scope.execute = function () {
      if ($scope.cf.testCase != null) {
        if ($scope.tokenPromise) {
          $timeout.cancel($scope.tokenPromise);
          $scope.tokenPromise = undefined;
        }
        $scope.error = null;
        $scope.tError = null;
        $scope.mError = null;
        $scope.vError = null;
        $scope.cf.message.content = $scope.editor.doc.getValue();
        $scope.setHasNonPrintableCharacters();
        StorageService.set(StorageService.CF_EDITOR_CONTENT_KEY, $scope.cf.message.content);
        $scope.validateMessage();
        $scope.parseMessage();
        $scope.refreshEditor();
      }
    };
    $scope.removeDuplicates = function () {
      $scope.vLoading = true;
      $scope.$broadcast('cf:removeDuplicates');
    };
    $scope.initValidation = function () {
      $scope.vLoading = false;
      $scope.tLoading = false;
      $scope.mLoading = false;
      $scope.error = null;
      $scope.tError = null;
      $scope.mError = null;
      $scope.vError = null;
      $scope.initCodemirror();
      $scope.refreshEditor();
      $scope.$on('cf:testCaseLoaded', function (event, testCase) {
        $scope.testCase = testCase;
        if ($scope.testCase != null) {
          var content = StorageService.get(StorageService.CF_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.CF_EDITOR_CONTENT_KEY);
          $scope.nodelay = true;
          $scope.mError = null;
          $scope.cf.editor = ServiceDelegator.getEditor($scope.testCase.testContext.format);
          $scope.cf.editor.instance = $scope.editor;
          $scope.cf.cursor = ServiceDelegator.getCursor($scope.testCase.testContext.format);
          TestStepService.clearRecords($scope.testCase.id);
          if ($scope.editor) {
            $scope.editor.doc.setValue(content);
            $scope.execute();
          }
        }
      });
      $rootScope.$on('cf:duplicatesRemoved', function (event, report) {
        $scope.vLoading = false;
      });
    };
    $scope.expandAll = function () {
      if ($scope.cf.tree.root != null)
        $scope.cf.tree.root.expand_all();
    };
    $scope.collapseAll = function () {
      if ($scope.cf.tree.root != null)
        $scope.cf.tree.root.collapse_all();
    };
    $scope.setHasNonPrintableCharacters = function () {
      $scope.hasNonPrintable = MessageUtil.hasNonPrintable($scope.cf.message.content);
    };
    $scope.showMessageWithHexadecimal = function () {
      var modalInstance = $modal.open({
          templateUrl: 'MessageWithHexadecimal.html',
          controller: 'MessageWithHexadecimalDlgCtrl',
          windowClass: 'valueset-modal',
          animation: false,
          keyboard: true,
          backdrop: true,
          resolve: {
            original: function () {
              return $scope.cf.message.content;
            }
          }
        });
    };
  }
]);
angular.module('cf').controller('CFReportCtrl', [
  '$scope',
  '$sce',
  '$http',
  'CF',
  function ($scope, $sce, $http, CF) {
    $scope.cf = CF;
  }
]);
angular.module('cf').controller('CFVocabularyCtrl', [
  '$scope',
  'CF',
  function ($scope, CF) {
    $scope.cf = CF;
  }
]);
angular.module('cf').controller('CFProfileViewerCtrl', [
  '$scope',
  'CF',
  '$rootScope',
  function ($scope, CF, $rootScope) {
    $scope.cf = CF;
  }
]);
'use strict';
angular.module('cb').controller('CBTestingCtrl', [
  '$scope',
  '$window',
  '$rootScope',
  'CB',
  'StorageService',
  '$timeout',
  'TestCaseService',
  'TestStepService',
  function ($scope, $window, $rootScope, CB, StorageService, $timeout, TestCaseService, TestStepService) {
    $scope.testCase = null;
    $scope.initTesting = function () {
      var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
      if (tab == null || tab != '/cb_execution')
        tab = '/cb_testcase';
      $rootScope.setSubActive(tab);
      $scope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
        $scope.testCase = testCase;
      });  //            $scope.$on("$destroy", function () {
           //                var previousId = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
           //                if (previousId != null)TestCaseService.clearRecords(previousId);
           //                previousId = StorageService.get(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
           //                if (previousId != null)TestStepService.clearRecords(previousId);
           //            });
    };
    $scope.setSubActive = function (tab) {
      $rootScope.setSubActive(tab);
      if (tab === '/cb_execution') {
        $scope.$broadcast('cb:refreshEditor');
      }
    };
  }
]);
angular.module('cb').controller('CBExecutionCtrl', [
  '$scope',
  '$window',
  '$rootScope',
  'CB',
  '$modal',
  'TestExecutionClock',
  'Endpoint',
  'TestExecutionService',
  '$timeout',
  'StorageService',
  'User',
  'ReportService',
  'TestCaseDetailsService',
  '$compile',
  'Transport',
  '$filter',
  'SOAPEscaper',
  'userInfoService',
  function ($scope, $window, $rootScope, CB, $modal, TestExecutionClock, Endpoint, TestExecutionService, $timeout, StorageService, User, ReportService, TestCaseDetailsService, $compile, Transport, $filter, SOAPEscaper, userInfoService) {
    $scope.targ = 'cb-executed-test-step';
    $scope.loading = false;
    $scope.error = null;
    $scope.tabs = new Array();
    $scope.testCase = null;
    $scope.testStep = null;
    $scope.logger = CB.logger;
    $scope.connecting = false;
    $scope.transport = Transport;
    $scope.endpoint = null;
    $scope.hidePwd = true;
    $scope.sent = null;
    $scope.received = null;
    $scope.configCollapsed = true;
    $scope.counterMax = 120;
    // 2min
    $scope.counter = 0;
    $scope.listenerReady = false;
    $scope.testStepListCollapsed = false;
    $scope.warning = null;
    $scope.sutInititiatorForm = '';
    $scope.taInititiatorForm = '';
    $scope.user = User;
    $scope.domain = null;
    $scope.protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ? StorageService.get(StorageService.TRANSPORT_PROTOCOL) : null;
    $scope.exampleMessageEditor = null;
    $scope.testExecutionService = TestExecutionService;
    $scope.loadingExecution = false;
    $scope.initExecution = function () {
      $scope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
        $scope.executeTestCase(testCase, tab);
      });
    };
    var errors = [
        'Incorrect message Received. Please check the log for more details',
        'No Outbound message found',
        'Invalid message Received. Please see console for more details.',
        'Invalid message Sent. Please see console for more details.'
      ];
    var parseRequest = function (incoming) {
      //            var x2js = new X2JS();
      //            var receivedJson = x2js.xml_str2json(incoming);
      //            var receivedMessage = SOAPEscaper.decodeXml(receivedJson.Envelope.Body.submitSingleMessage.hl7Message.toString());
      return incoming;
    };
    var parseResponse = function (outbound) {
      //            var x2js = new X2JS();
      //            var sentMessageJson = x2js.xml_str2json(outbound);
      //            var sentMessage = SOAPEscaper.decodeXml(sentMessageJson.Envelope.Body.submitSingleMessageResponse.return.toString());
      return outbound;
    };
    $scope.setTestStepExecutionTab = function (value) {
      $scope.tabs[0] = false;
      $scope.tabs[1] = false;
      $scope.tabs[2] = false;
      $scope.tabs[3] = false;
      $scope.tabs[4] = false;
      $scope.tabs[5] = false;
      $scope.tabs[6] = false;
      $scope.tabs[7] = false;
      $scope.tabs[8] = false;
      $scope.tabs[9] = false;
      $scope.activeTab = value;
      $scope.tabs[$scope.activeTab] = true;
      if ($scope.activeTab === 5) {
        $scope.buildExampleMessageEditor();
      } else if ($scope.activeTab === 6) {
        $scope.loadArtifactHtml('jurorDocument');
      } else if ($scope.activeTab === 7) {
        $scope.loadArtifactHtml('messageContent');
      } else if ($scope.activeTab === 8) {
        $scope.loadArtifactHtml('testDataSpecification');
      } else if ($scope.activeTab === 9) {
        $scope.loadArtifactHtml('testStory');
      }
    };
    $scope.getTestType = function () {
      return CB.testCase.type;
    };
    $scope.disabled = function () {
      return CB.testCase == null || CB.testCase.id === null;
    };
    $scope.getTestType = function () {
      return $scope.testCase != null ? $scope.testCase.type : '';
    };
    $scope.loadTestStepDetails = function (testStep) {
      var tsId = $scope.targ + '-testStory';
      var jDocId = $scope.targ + '-jurorDocument';
      var mcId = $scope.targ + '-messageContent';
      var tdsId = $scope.targ + '-testDataSpecification';
      TestCaseDetailsService.removeHtml(tdsId);
      TestCaseDetailsService.removeHtml(mcId);
      TestCaseDetailsService.removeHtml(jDocId);
      TestCaseDetailsService.removeHtml(tsId);
      $scope.$broadcast(tsId, testStep['testStory'], testStep.name + '-TestStory');
      $scope.$broadcast(jDocId, testStep['jurorDocument'], testStep.name + '-JurorDocument');
      $scope.$broadcast(mcId, testStep['messageContent'], testStep.name + '-MessageContent');
      $scope.$broadcast(tdsId, testStep['testDataSpecification'], testStep.name + '-TestDataSpecification');
      if ($scope.isManualStep(testStep)) {
        $scope.setTestStepExecutionTab(1);  // show report tab content
      }
    };
    $scope.loadTestStepExecutionPanel = function (testStep) {
      $scope.exampleMessageEditor = null;
      $scope.detailsError = null;
      var testContext = testStep['testContext'];
      if (testContext && testContext != null) {
        $scope.setTestStepExecutionTab(0);
        $scope.$broadcast('cb:testStepLoaded', testStep);
        $scope.$broadcast('cb:profileLoaded', testContext.profile);
        $scope.$broadcast('cb:valueSetLibraryLoaded', testContext.vocabularyLibrary);
        TestCaseDetailsService.removeHtml($scope.targ + '-exampleMessage');
        var exampleMessage = testContext.message && testContext.message.content && testContext.message.content != null ? testContext.message.content : null;
        if (exampleMessage != null) {
          $scope.$broadcast($scope.targ + '-exampleMessage', exampleMessage, testContext.format, testStep.name);
        }
      } else {
        // manual testing ?
        $scope.setTestStepExecutionTab(1);
        var report = TestExecutionService.getTestStepValidationReportObject(testStep);
        console.log('>>>>>>>>>>>>> ' + report);
        report = report != undefined ? report : null;
        $rootScope.$emit('cb:initValidationReport', report, testStep);
      }
      var exampleMsgId = $scope.targ + '-exampleMessage';
      TestCaseDetailsService.details('TestStep', testStep.id).then(function (result) {
        testStep['testStory'] = result['testStory'];
        testStep['jurorDocument'] = result['jurorDocument'];
        testStep['testDataSpecification'] = result['testDataSpecification'];
        testStep['messageContent'] = result['messageContent'];
        $scope.loadTestStepDetails(testStep);
        $scope.detailsError = null;
      }, function (error) {
        testStep['testStory'] = null;
        testStep['testPackage'] = null;
        testStep['jurorDocument'] = null;
        testStep['testDataSpecification'] = null;
        testStep['messageContent'] = null;
        $scope.loadTestStepDetails(testStep);
        $scope.detailsError = 'Sorry, could not load the test step details. Please try again';
      });
    };
    $scope.buildExampleMessageEditor = function () {
      var eId = $scope.targ + '-exampleMessage';
      if ($scope.exampleMessageEditor === null || !$scope.exampleMessageEditor) {
        $timeout(function () {
          $scope.exampleMessageEditor = TestCaseDetailsService.buildExampleMessageEditor(eId, $scope.testStep.testContext.message.content, $scope.exampleMessageEditor, $scope.testStep.testContext && $scope.testStep.testContext != null ? $scope.testStep.testContext.format : null);
        }, 100);
      }
      $timeout(function () {
        if ($('#' + eId)) {
          $('#' + eId).scrollLeft();
        }
      }, 1000);
    };
    $scope.loadArtifactHtml = function (key) {
      if ($scope.testStep != null) {
        var element = TestCaseDetailsService.loadArtifactHtml($scope.targ + '-' + key, $scope.testStep[key]);
        if (element && element != null) {
          $compile(element.contents())($scope);
        }
      }
    };
    $scope.resetTestCase = function () {
      if ($scope.testCase != null) {
        $scope.loadingExecution = true;
        $scope.error = null;
        TestExecutionService.clear($scope.testCase.id).then(function (res) {
          $scope.loadingExecution = false;
          $scope.error = null;
          if (CB.editor != null && CB.editor.instance != null) {
            CB.editor.instance.setOption('readOnly', false);
          }
          StorageService.remove(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY);
          StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
          $scope.executeTestCase($scope.testCase);
        }, function (error) {
          $scope.loadingExecution = false;
          $scope.error = null;
        });
      }
    };
    $scope.selectProtocol = function (testStep) {
      if (testStep != null) {
        $scope.protocol = testStep.protocol;
        StorageService.set(StorageService.TRANSPORT_PROTOCOL, $scope.protocol);
      }
    };
    $scope.selectTestStep = function (testStep) {
      CB.testStep = testStep;
      $scope.testStep = testStep;
      if (testStep != null) {
        StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
        StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
        if (!$scope.isManualStep(testStep)) {
          if ($scope.testExecutionService.getTestStepExecutionMessage(testStep) === undefined && testStep['testingType'] === 'TA_INITIATOR') {
            if (!$scope.transport.disabled && $scope.domain != null && $scope.protocol != null) {
              var populateMessage = $scope.transport.populateMessage(testStep.id, testStep.testContext.message.content, $scope.domain, $scope.protocol);
              populateMessage.then(function (response) {
                $scope.testExecutionService.setTestStepExecutionMessage(testStep, response.outgoingMessage);
                $scope.loadTestStepExecutionPanel(testStep);
              }, function (error) {
                $scope.testExecutionService.setTestStepExecutionMessage(testStep, testStep.testContext.message.content);
                $scope.loadTestStepExecutionPanel(testStep);
              });
            } else {
              var con = $scope.testExecutionService.getTestStepExecutionMessage(testStep);
              con = con != null && con != undefined ? con : testStep.testContext.message.content;
              $scope.testExecutionService.setTestStepExecutionMessage(testStep, con);
              $scope.loadTestStepExecutionPanel(testStep);
            }
          } else if ($scope.testExecutionService.getTestStepExecutionMessage(testStep) === undefined && testStep['testingType'] === 'TA_RESPONDER' && $scope.transport.disabled) {
            $scope.testExecutionService.setTestStepExecutionMessage(testStep, testStep.testContext.message.content);
            $scope.loadTestStepExecutionPanel(testStep);
          } else {
            $scope.loadTestStepExecutionPanel(testStep);
          }
        } else {
          $scope.loadTestStepExecutionPanel(testStep);
        }
      }
    };
    $scope.viewTestStepResult = function (testStep) {
      CB.testStep = testStep;
      $scope.testStep = testStep;
      if (testStep != null) {
        StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
        StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
        $scope.loadTestStepExecutionPanel(testStep);
      }
    };
    $scope.clearTestStep = function () {
      CB.testStep = null;
      $scope.testStep = null;
      $scope.$broadcast('cb:removeTestStep');
    };
    $scope.getTestStepExecutionStatus = function (testStep) {
      return $scope.testExecutionService.getTestStepExecutionStatus(testStep);
    };
    $scope.getTestStepValidationResult = function (testStep) {
      return $scope.testExecutionService.getTestStepValidationResult(testStep);
    };
    $scope.getTestStepValidationReport = function (testStep) {
      return $scope.testExecutionService.getTestStepValidationReport(testStep);
    };
    $scope.getManualValidationStatusTitle = function (testStep) {
      return $scope.testExecutionService.getManualValidationStatusTitle(testStep);
    };
    $scope.isManualStep = function (testStep) {
      return testStep != null && (testStep['testingType'] === 'TA_MANUAL' || testStep['testingType'] === 'SUT_MANUAL');
    };
    $scope.isSutInitiator = function (testStep) {
      return testStep['testingType'] == 'SUT_INITIATOR';
    };
    $scope.isTaInitiator = function (testStep) {
      return testStep['testingType'] == 'TA_INITIATOR';
    };
    $scope.isTestStepCompleted = function (testStep) {
      return $scope.testExecutionService.getTestStepExecutionStatus(testStep) === 'COMPLETE';
    };
    $scope.completeStep = function (row) {
      $scope.testExecutionService.setTestStepExecutionStatus(row, 'COMPLETE');
    };
    $scope.completeManualStep = function (row) {
      $scope.completeStep(row);
    };
    $scope.progressStep = function (row) {
      $scope.testExecutionService.setTestStepExecutionStatus(row, 'IN_PROGRESS');
    };
    $scope.goNext = function (row) {
      if (row != null && row) {
        if (!$scope.isLastStep(row)) {
          $scope.executeTestStep($scope.findNextStep(row.position));
        } else {
          $scope.completeTestCase();
        }
      }
    };
    $scope.goBack = function (row) {
      if (row != null && row) {
        if (!$scope.isFirstStep(row)) {
          $scope.executeTestStep($scope.findPreviousStep(row.position));
        }
      }
    };
    $scope.executeTestStep = function (testStep) {
      TestExecutionService.initTestStep(testStep).then(function (report) {
        TestExecutionService.setTestStepValidationReportObject(testStep, report);
        CB.testStep = testStep;
        $scope.warning = null;
        if ($scope.isManualStep(testStep) || testStep.testingType === 'TA_RESPONDER') {
          $scope.testExecutionService.setTestStepExecutionStatus(testStep, 'COMPLETE');
        }
        testStep.protocol = null;
        $scope.protocol = null;
        if (testStep.protocols != null && testStep.protocols && testStep.protocols.length > 0) {
          var protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ? StorageService.get(StorageService.TRANSPORT_PROTOCOL) : null;
          protocol = protocol != null && testStep.protocols.indexOf(protocol) > 0 ? protocol : null;
          protocol = protocol != null ? protocol : $scope.getDefaultProtocol(testStep);
          testStep['protocol'] = protocol;
          $scope.selectProtocol(testStep);
        }
        var log = $scope.transport.logs[testStep.id];
        $scope.logger.content = log && log != null ? log : '';
        $scope.selectTestStep(testStep);
      }, function (error) {
        $scope.error = 'Failed to load the test step, please try again.';
      });
    };
    $scope.getDefaultProtocol = function (testStep) {
      if (testStep.protocols != null && testStep.protocols && testStep.protocols.length > 0) {
        testStep.protocols = $filter('orderBy')(testStep.protocols, 'position');
        for (var i = 0; i < testStep.protocols.length; i++) {
          if (testStep.protocols[i]['defaut'] != undefined && testStep.protocols[i]['defaut'] === true) {
            return testStep.protocols[i].value;
          }
        }
        return testStep.protocols[0].value;
      }
      return null;
    };
    $scope.completeTestCase = function () {
      StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
      $scope.testExecutionService.setTestCaseExecutionStatus($scope.testCase, 'COMPLETE');
      if (CB.editor.instance != null) {
        CB.editor.instance.setOption('readOnly', true);
      }
      TestExecutionService.setTestCaseValidationResultFromTestSteps($scope.testCase);
      $scope.clearTestStep();
      $scope.selectTestStep(null);
    };
    $scope.isTestCaseCompleted = function () {
      return $scope.testExecutionService.getTestCaseExecutionStatus($scope.testCase) === 'COMPLETE';
    };
    $scope.shouldNextStep = function (row) {
      return $scope.testStep != null && $scope.testStep === row && !$scope.isTestCaseCompleted() && !$scope.isLastStep(row) && $scope.isTestStepCompleted(row);
    };
    $scope.isLastStep = function (row) {
      return row && row != null && $scope.testCase != null && $scope.testCase.children.length === row.position;
    };
    $scope.isFirstStep = function (row) {
      return row && row != null && $scope.testCase != null && row.position === 1;
    };
    $scope.isTestCaseSuccessful = function () {
      var status = $scope.testExecutionService.getTestCaseValidationResult($scope.testCase);
      return status === 'PASSED';
    };
    $scope.isTestStepValidated = function (testStep) {
      return $scope.testExecutionService.getTestStepValidationResult(testStep) != undefined;
    };
    $scope.isTestStepSuccessful = function (testStep) {
      var status = $scope.testExecutionService.getTestStepValidationResult(testStep);
      return status == 'PASSED' || 'PASSED_NOTABLE_EXCEPTION' ? true : false;
    };
    $scope.findNextStep = function (position) {
      var nextStep = null;
      for (var i = 0; i < $scope.testCase.children.length; i++) {
        if ($scope.testCase.children[i].position === position + 1) {
          return $scope.testCase.children[i];
        }
      }
      return null;
    };
    $scope.findPreviousStep = function (position) {
      var nextStep = null;
      for (var i = 0; i < $scope.testCase.children.length; i++) {
        if ($scope.testCase.children[i].position === position - 1) {
          return $scope.testCase.children[i];
        }
      }
      return null;
    };
    $scope.clearExecution = function () {
      if (CB.editor != null && CB.editor.instance != null) {
        CB.editor.instance.setOption('readOnly', false);
      }
      $scope.loadingExecution = true;
      $scope.error = null;
      TestExecutionService.clear($scope.testCase).then(function (res) {
        $scope.loadingExecution = false;
        $scope.error = null;
      }, function (error) {
        $scope.loadingExecution = false;
        $scope.error = null;
      });
    };
    $scope.setNextStepMessage = function (message) {
      var nextStep = $scope.findNextStep($scope.testStep.position);
      if (nextStep != null && !$scope.isManualStep(nextStep)) {
        $scope.completeStep(nextStep);
        $scope.testExecutionService.setTestStepExecutionMessage(nextStep, message);
      }
    };
    $scope.log = function (log) {
      $scope.logger.log(log);
    };
    $scope.isValidConfig = function () {
    };
    $scope.outboundMessage = function () {
      return $scope.testStep != null ? $scope.testStep.testContext.message.content : null;
    };
    $scope.hasUserContent = function () {
      return CB.editor && CB.editor != null && CB.editor.instance.doc.getValue() != null && CB.editor.instance.doc.getValue() != '';
    };
    $scope.hasRequestContent = function () {
      return $scope.outboundMessage() != null && $scope.outboundMessage() != '';
    };
    $scope.send = function () {
      $scope.connecting = true;
      $scope.openConsole($scope.testStep);
      $scope.logger.clear();
      $scope.progressStep($scope.testStep);
      $scope.error = null;
      if ($scope.hasUserContent()) {
        $scope.received = '';
        $scope.logger.log('Sending outbound Message. Please wait...');
        $scope.transport.send($scope.testStep.id, CB.editor.instance.doc.getValue(), $scope.domain, $scope.protocol).then(function (response) {
          var received = response.incoming;
          var sent = response.outgoing;
          $scope.logger.log('Outbound Message  -------------------------------------->');
          if (sent != null && sent != '') {
            $scope.logger.log(sent);
            $scope.logger.log('Inbound Message  <--------------------------------------');
            if (received != null && received != '') {
              try {
                $scope.completeStep($scope.testStep);
                var rspMessage = parseResponse(received);
                $scope.logger.log(received);
                $scope.setNextStepMessage(rspMessage);
              } catch (error) {
                $scope.error = errors[0];
                $scope.logger.log('An error occured: ' + $scope.error);
              }
            } else {
              $scope.logger.log('No Inbound message received');
            }
          } else {
            $scope.logger.log('No outbound message sent');
          }
          $scope.connecting = false;
          $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
          $scope.logger.log('Transaction completed');
        }, function (error) {
          $scope.connecting = false;
          $scope.error = error.data;
          $scope.logger.log('Error: ' + error.data);
          $scope.received = '';
          $scope.completeStep($scope.testStep);
          $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
          $scope.logger.log('Transaction stopped');
        });
      } else {
        $scope.error = 'No message to send';
        $scope.connecting = false;
        $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
        $scope.logger.log('Transaction completed');
      }
    };
    $scope.viewConsole = function (testStep) {
      if ($scope.consoleDlg && $scope.consoleDlg !== null && $scope.consoleDlg.opened) {
        $scope.consoleDlg.dismiss('cancel');
      }
      $scope.consoleDlg = $modal.open({
        templateUrl: 'PastTestStepConsole.html',
        controller: 'PastTestStepConsoleCtrl',
        windowClass: 'console-modal',
        size: 'sm',
        animation: true,
        keyboard: true,
        backdrop: true,
        resolve: {
          log: function () {
            return $scope.transport.logs[testStep.id];
          },
          title: function () {
            return testStep.name;
          }
        }
      });
    };
    $scope.openConsole = function (testStep) {
      if ($scope.consoleDlg && $scope.consoleDlg !== null && $scope.consoleDlg.opened) {
        $scope.consoleDlg.dismiss('cancel');
      }
      $scope.consoleDlg = $modal.open({
        templateUrl: 'CurrentTestStepConsole.html',
        controller: 'CurrentTestStepConsoleCtrl',
        windowClass: 'console-modal',
        size: 'sm',
        animation: true,
        keyboard: true,
        backdrop: true,
        resolve: {
          logger: function () {
            return $scope.logger;
          },
          title: function () {
            return testStep.name;
          }
        }
      });
    };
    $scope.stopListener = function () {
      $scope.connecting = false;
      $scope.counter = $scope.counterMax;
      TestExecutionClock.stop();
      $scope.logger.log('Stopping listener. Please wait....');
      $scope.transport.stopListener($scope.testStep.id, $scope.domain, $scope.protocol).then(function (response) {
        $scope.logger.log('Listener stopped.');
        $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
      }, function (error) {
      });
    };
    $scope.updateTestStepValidationReport = function (testStep) {
      StorageService.set('testStepValidationResults', angular.toJson(TestExecutionService.testStepValidationResults));
      StorageService.set('testStepComments', angular.toJson(TestExecutionService.testStepComments));
      if ($scope.testStep === null || testStep.id !== $scope.testStep.id) {
        TestExecutionService.updateTestStepValidationReport(testStep);
      } else {
        $rootScope.$emit('cb:updateTestStepValidationReport', null, testStep);
      }
    };
    $scope.persistentReportSaved = false;
    $scope.isAuthenticated = function () {
      return userInfoService.isAuthenticated();
    };
    $scope.savePersistentReport = function () {
      if ($scope.testCase != null) {
        var result = TestExecutionService.getTestCaseValidationResult($scope.testCase);
        result = result != undefined ? result : null;
        var comments = TestExecutionService.getTestCaseComments($scope.testCase);
        comments = comments != undefined ? comments : null;
        //$scope.testCase.id
        ReportService.savePersistentReport($scope.testCase.id, result, comments).then(function () {
          $scope.persistentReportSaved = true;
        }, function () {
          console.log('Unable to save the report.');
        });
      }
    };
    $scope.abortListening = function () {
      $scope.testExecutionService.deleteTestStepExecutionStatus($scope.testStep);
      $scope.stopListener();
    };
    $scope.completeListening = function () {
      $scope.testExecutionService.setTestStepExecutionStatus($scope.testStep, 'COMPLETE');
      $scope.stopListener();
    };
    $scope.startListener = function () {
      $scope.openConsole($scope.testStep);
      var nextStep = $scope.findNextStep($scope.testStep.position);
      if (nextStep != null) {
        var rspMessageId = nextStep.testContext.message.id;
        $scope.configCollapsed = false;
        $scope.logger.clear();
        $scope.counter = 0;
        $scope.connecting = true;
        $scope.error = null;
        $scope.warning = null;
        $scope.progressStep($scope.testStep);
        $scope.logger.log('Starting listener. Please wait...');
        $scope.transport.startListener($scope.testStep.id, rspMessageId, $scope.domain, $scope.protocol).then(function (started) {
          if (started) {
            $scope.logger.log('Listener started.');
            var execute = function () {
              ++$scope.counter;
              $scope.logger.log('Waiting for Inbound Message....Elapsed time(second):' + $scope.counter + 's');
              var sutInitiator = null;
              try {
                sutInitiator = $scope.transport.configs[$scope.domain][$scope.protocol].data.sutInitiator;
              } catch (e) {
                sutInitiator = null;
              }
              $scope.transport.searchTransaction($scope.testStep.id, sutInitiator, rspMessageId, $scope.domain, $scope.protocol).then(function (transaction) {
                if (transaction != null) {
                  var incoming = transaction.incoming;
                  var outbound = transaction.outgoing;
                  $scope.logger.log('Inbound message received <-------------------------------------- ');
                  if (incoming != null && incoming != '') {
                    try {
                      var receivedMessage = parseRequest(incoming);
                      $scope.log(receivedMessage);
                      $scope.testExecutionService.setTestStepExecutionMessage($scope.testStep, receivedMessage);
                      $scope.$broadcast('cb:loadEditorContent', receivedMessage);
                    } catch (error) {
                      $scope.error = errors[2];
                      $scope.logger.log('Incorrect Inbound message type');
                    }
                  } else {
                    $scope.logger.log('Incoming message received is empty');
                  }
                  $scope.logger.log('Outbound message sent --------------------------------------> ');
                  if (outbound != null && outbound != '') {
                    try {
                      var sentMessage = parseResponse(outbound);
                      $scope.log(sentMessage);
                      $scope.setNextStepMessage(sentMessage);
                    } catch (error) {
                      $scope.error = errors[3];
                      $scope.logger.log('Incorrect outgoing message type');
                    }
                  } else {
                    $scope.logger.log('Outbound message sent is empty');
                  }
                  $scope.completeListening();
                } else if ($scope.counter >= $scope.counterMax) {
                  $scope.warning = 'We did not receive any incoming message after 2 min. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound message against those created for your system.</p>  <p>Possible cause (2):The endpoint address may be incorrect.   Verify that you are using the correct endpoint address that is displayed by the tool.</p>';
                  $scope.abortListening();
                }
              }, function (error) {
                $scope.error = error;
                $scope.log('Error: ' + error);
                $scope.received = '';
                $scope.sent = '';
                $scope.abortListening();
              });
            };
            TestExecutionClock.start(execute);
          } else {
            $scope.logger.log('Failed to start listener');
            $scope.logger.log('Transaction stopped');
            $scope.connecting = false;
            $scope.error = 'Failed to start the listener. Please contact the administrator.';
            TestExecutionClock.stop();
          }
        }, function (error) {
          $scope.connecting = false;
          $scope.counter = $scope.counterMax;
          $scope.error = 'Failed to start the listener. Error: ' + error;
          $scope.logger.log($scope.error);
          $scope.logger.log('Transaction stopped');
          TestExecutionClock.stop();
        });
      }
    };
    $scope.downloadJurorDoc = function (jurorDocId, title) {
      var content = $('#' + jurorDocId).html();
      if (content && content != '') {
        var form = document.createElement('form');
        form.action = 'api/artifact/generateJurorDoc/pdf';
        form.method = 'POST';
        form.target = '_target';
        var input = document.createElement('textarea');
        input.name = 'html';
        input.value = content;
        form.appendChild(input);
        var type = document.createElement('input');
        type.name = 'type';
        type.value = 'JurorDocument';
        form.style.display = 'none';
        form.appendChild(type);
        var nam = document.createElement('input');
        nam.name = 'type';
        nam.value = title;
        form.style.display = 'none';
        form.appendChild(nam);
        document.body.appendChild(form);
        form.submit();
      }
    };
    $scope.downloadTestArtifact = function (path) {
      if ($scope.testCase != null) {
        var form = document.createElement('form');
        form.action = 'api/artifact/download';
        form.method = 'POST';
        form.target = '_target';
        var input = document.createElement('input');
        input.name = 'path';
        input.value = path;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
      }
    };
    $scope.executeTestCase = function (testCase, tab) {
      if (testCase != null) {
        $scope.loading = true;
        TestExecutionService.init();
        CB.testStep = null;
        $scope.testStep = null;
        $scope.setTestStepExecutionTab(0);
        tab = tab && tab != null ? tab : '/cb_execution';
        $rootScope.setSubActive(tab);
        if (tab === '/cb_execution') {
          $scope.$broadcast('cb:refreshEditor');
        }
        $scope.logger.clear();
        $scope.error = null;
        $scope.warning = null;
        $scope.connecting = false;
        $scope.domain = testCase.domain;
        CB.testCase = testCase;
        $scope.transport.logs = {};
        $scope.transport.transactions = [];
        $scope.testCase = testCase;
        TestExecutionClock.stop();
        if (CB.editor != null && CB.editor.instance != null) {
          CB.editor.instance.setOption('readOnly', false);
        }
        if (testCase.type === 'TestCase') {
          var testStepId = StorageService.get(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
          var testStep = $scope.findTestStepById(testStepId);
          testStep = testStep != null ? testStep : $scope.testCase.children[0];
          $scope.executeTestStep(testStep);
        } else if (testCase.type === 'TestStep') {
          $scope.executeTestStep(testCase);
        }
        $scope.loading = false;
      }
    };
    $scope.findTestStepById = function (testStepId) {
      if (testStepId != null && testStepId != undefined) {
        for (var i = 0; i < $scope.testCase.children.length; i++) {
          if ($scope.testCase.children[i].id === testStepId) {
            return $scope.testCase.children[i];
          }
        }
      }
      return null;
    };
    $scope.exportAs = function (format) {
      if ($scope.testCase != null) {
        var result = TestExecutionService.getTestCaseValidationResult($scope.testCase);
        result = result != undefined ? result : null;
        var comments = TestExecutionService.getTestCaseComments($scope.testCase);
        comments = comments != undefined ? comments : null;
        ReportService.downloadTestCaseReports($scope.testCase.id, format, result, comments);
      }
    };
    $scope.toggleTransport = function (disabled) {
      $scope.transport.disabled = disabled;
      StorageService.set(StorageService.TRANSPORT_DISABLED, disabled);
      if (CB.editor.instance != null) {
        CB.editor.instance.setOption('readOnly', !disabled);
      }
    };
  }
]);
angular.module('cb').controller('CBTestCaseCtrl', [
  '$scope',
  '$window',
  '$filter',
  '$rootScope',
  'CB',
  '$timeout',
  'CBTestCaseListLoader',
  '$sce',
  'StorageService',
  'TestCaseService',
  'TestStepService',
  'TestExecutionService',
  function ($scope, $window, $filter, $rootScope, CB, $timeout, CBTestCaseListLoader, $sce, StorageService, TestCaseService, TestStepService, TestExecutionService) {
    $scope.selectedTestCase = CB.selectedTestCase;
    $scope.testCase = CB.testCase;
    $scope.testCases = [];
    $scope.tree = {};
    $scope.loading = true;
    $scope.loadingTC = false;
    $scope.error = null;
    $scope.collapsed = false;
    var testCaseService = new TestCaseService();
    $scope.initTestCase = function () {
      $scope.error = null;
      $scope.loading = true;
      var tcLoader = new CBTestCaseListLoader();
      tcLoader.then(function (testCases) {
        $scope.error = null;
        angular.forEach(testCases, function (testPlan) {
          testCaseService.buildTree(testPlan);
        });
        $scope.testCases = testCases;
        $scope.refreshTree();
      }, function (error) {
        $scope.loading = false;
        $scope.error = 'Sorry, Cannot load the test cases. Please try again';
      });
    };
    $scope.refreshTree = function () {
      $timeout(function () {
        if ($scope.testCases != null) {
          if (typeof $scope.tree.build_all == 'function') {
            $scope.tree.build_all($scope.testCases);
            var testCase = null;
            var id = StorageService.get(StorageService.CB_SELECTED_TESTCASE_ID_KEY);
            var type = StorageService.get(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY);
            if (id != null && type != null) {
              for (var i = 0; i < $scope.testCases.length; i++) {
                var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                if (found != null) {
                  testCase = found;
                  break;
                }
              }
              if (testCase != null) {
                $scope.selectNode(id, type);
              }
            }
            testCase = null;
            id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
            type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
            if (id != null && type != null) {
              for (var i = 0; i < $scope.testCases.length; i++) {
                var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                if (found != null) {
                  testCase = found;
                  break;
                }
              }
              if (testCase != null) {
                var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                $scope.loadTestCase(testCase, tab, false);
              }
            }
          } else {
            $scope.error = 'Ooops, Something went wrong. Please refresh your page again.';
          }
        }
        $scope.loading = false;
      }, 1000);
    };
    $scope.isSelectable = function (node) {
      return true;
    };
    $scope.selectTestCase = function (node) {
      $scope.loadingTC = true;
      $scope.selectedTestCase = node;
      StorageService.set(StorageService.CB_SELECTED_TESTCASE_ID_KEY, node.id);
      StorageService.set(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY, node.type);
      $timeout(function () {
        $scope.$broadcast('cb:testCaseSelected', $scope.selectedTestCase);
        $scope.loadingTC = false;
      });
    };
    $scope.selectNode = function (id, type) {
      $timeout(function () {
        testCaseService.selectNodeByIdAndType($scope.tree, id, type);
      }, 0);
    };
    $scope.loadTestCase = function (testCase, tab, clear) {
      var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
      var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
      StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, testCase.id);
      StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, testCase.type);
      if (clear === undefined || clear === true) {
        StorageService.remove(StorageService.CB_EDITOR_CONTENT_KEY);
        var previousId = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
        TestExecutionService.clear(previousId);
        StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
      }
      $timeout(function () {
        $rootScope.$broadcast('cb:testCaseLoaded', testCase, tab);
      });
      if (CB.editor != null && CB.editor.instance != null) {
        CB.editor.instance.setOption('readOnly', false);
      }
    };
    $scope.expandAll = function () {
      if ($scope.tree != null)
        $scope.tree.expand_all();
    };
    $scope.collapseAll = function () {
      if ($scope.tree != null)
        $scope.tree.collapse_all();
    };
  }
]);
angular.module('cb').controller('CBValidatorCtrl', [
  '$scope',
  '$http',
  'CB',
  '$window',
  '$timeout',
  '$modal',
  'NewValidationResult',
  '$rootScope',
  'ServiceDelegator',
  'StorageService',
  'TestExecutionService',
  'MessageUtil',
  function ($scope, $http, CB, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, TestExecutionService, MessageUtil) {
    $scope.cb = CB;
    $scope.testStep = null;
    $scope.message = CB.message;
    $scope.loading = true;
    $scope.error = null;
    $scope.vError = null;
    $scope.vLoading = true;
    $scope.mError = null;
    $scope.mLoading = true;
    $scope.counter = 0;
    $scope.type = 'cb';
    $scope.loadRate = 4000;
    $scope.tokenPromise = null;
    $scope.editorInit = false;
    $scope.nodelay = false;
    $scope.resized = false;
    $scope.selectedItem = null;
    $scope.activeTab = 0;
    $scope.tError = null;
    $scope.tLoading = false;
    $scope.dqaCodes = StorageService.get(StorageService.DQA_OPTIONS_KEY) != null ? angular.fromJson(StorageService.get(StorageService.DQA_OPTIONS_KEY)) : [];
    $scope.domain = null;
    $scope.protocol = null;
    $scope.hasNonPrintable = false;
    $scope.showDQAOptions = function () {
      var modalInstance = $modal.open({
          templateUrl: 'DQAConfig.html',
          controller: 'DQAConfigCtrl',
          windowClass: 'dq-modal',
          animation: true,
          keyboard: false,
          backdrop: false
        });
      modalInstance.result.then(function (selectedCodes) {
        $scope.dqaCodes = selectedCodes;
      }, function () {
      });
    };
    $scope.isTestCase = function () {
      return CB.testCase != null && CB.testCase.type === 'TestCase';
    };
    $scope.refreshEditor = function () {
      $timeout(function () {
        if ($scope.editor)
          $scope.editor.refresh();
      }, 1000);
    };
    $scope.loadExampleMessage = function () {
      if ($scope.testStep != null) {
        var testContext = $scope.testStep.testContext;
        if (testContext) {
          var message = testContext.message && testContext.message != null ? testContext.message.content : '';
          if ($scope.isTestCase()) {
            TestExecutionService.setTestStepExecutionMessage($scope.testStep, message);
          }
          $scope.nodelay = true;
          $scope.cb.editor.instance.doc.setValue(message);
          $scope.execute();
        }
      }
    };
    $scope.options = {
      paramName: 'file',
      formAcceptCharset: 'utf-8',
      autoUpload: true,
      type: 'POST'
    };
    $scope.$on('fileuploadadd', function (e, data) {
      if (data.autoUpload || data.autoUpload !== false && $(this).fileupload('option', 'autoUpload')) {
        data.process().done(function () {
          var fileName = data.files[0].name;
          data.url = 'api/message/upload';
          var jqXHR = data.submit().success(function (result, textStatus, jqXHR) {
              $scope.nodelay = true;
              var tmp = angular.fromJson(result);
              $scope.cb.message.name = fileName;
              $scope.cb.editor.instance.doc.setValue(tmp.content);
              $scope.mError = null;
              $scope.execute();
            }).error(function (jqXHR, textStatus, errorThrown) {
              $scope.cb.message.name = fileName;
              $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ', Error: ' + errorThrown;
            }).complete(function (result, textStatus, jqXHR) {
            });
        });
      }
    });
    $scope.setLoadRate = function (value) {
      $scope.loadRate = value;
    };
    $scope.initCodemirror = function () {
      $scope.editor = CodeMirror.fromTextArea(document.getElementById('cb-textarea'), {
        lineNumbers: true,
        fixedGutter: true,
        theme: 'elegant',
        readOnly: false,
        showCursorWhenSelecting: true
      });
      $scope.editor.setSize('100%', 345);
      $scope.editor.on('keyup', function () {
        $timeout(function () {
          var msg = $scope.editor.doc.getValue();
          $scope.error = null;
          if ($scope.tokenPromise) {
            $timeout.cancel($scope.tokenPromise);
            $scope.tokenPromise = undefined;
          }
          if (msg.trim() !== '') {
            $scope.tokenPromise = $timeout(function () {
              $scope.execute();
            }, $scope.loadRate);
          } else {
            $scope.execute();
          }
        });
      });
      $scope.editor.on('dblclick', function (editor) {
        $timeout(function () {
          var coordinate = ServiceDelegator.getCursorService($scope.testStep.testContext.format).getCoordinate($scope.editor, $scope.cb.tree);
          if (coordinate && coordinate != null) {
            coordinate.lineNumber = coordinate.line;
            coordinate.startIndex = coordinate.startIndex + 1;
            coordinate.endIndex = coordinate.endIndex + 1;
            $scope.cb.cursor.init(coordinate, true);
            ServiceDelegator.getTreeService($scope.testStep.testContext.format).selectNodeByIndex($scope.cb.tree.root, CB.cursor, CB.message.content);
          }
        });
      });
    };
    $scope.validateMessage = function () {
      try {
        if ($scope.testStep != null) {
          if ($scope.cb.message.content !== '' && $scope.testStep.testContext != null) {
            $scope.vLoading = true;
            $scope.vError = null;
            TestExecutionService.deleteTestStepValidationReport($scope.testStep);
            var validator = ServiceDelegator.getMessageValidator($scope.testStep.testContext.format).validate($scope.testStep.testContext.id, $scope.cb.message.content, $scope.testStep.nav, 'Based', [], '1223');
            validator.then(function (mvResult) {
              $scope.vLoading = false;
              $scope.setTestStepValidationReport(mvResult);
            }, function (error) {
              $scope.vLoading = false;
              $scope.vError = error;
              $scope.setTestStepValidationReport(null);
            });
          } else {
            $scope.setTestStepValidationReport(TestExecutionService.getTestStepValidationReport($scope.testStep));
            $scope.vLoading = false;
            $scope.vError = null;
          }
        }
      } catch (error) {
        $scope.vLoading = false;
        $scope.vError = null;
        $scope.setTestStepValidationReport(null);
      }
    };
    $scope.setTestStepValidationReport = function (mvResult) {
      if ($scope.testStep != null) {
        if (mvResult != null) {
          TestExecutionService.setTestStepExecutionStatus($scope.testStep, 'COMPLETE');
          TestExecutionService.setTestStepValidationReport($scope.testStep, mvResult);
        }
        $rootScope.$emit('cb:validationResultLoaded', mvResult, $scope.testStep);
      }
    };
    $scope.setTestStepMessageTree = function (messageObject) {
      $scope.buildMessageTree(messageObject);
      var tree = messageObject && messageObject != null && messageObject.elements ? messageObject : undefined;
      TestExecutionService.setTestStepMessageTree($scope.testStep, tree);
    };
    $scope.buildMessageTree = function (messageObject) {
      if ($scope.testStep != null) {
        var elements = messageObject && messageObject != null && messageObject.elements ? messageObject.elements : [];
        if (typeof $scope.cb.tree.root.build_all == 'function') {
          $scope.cb.tree.root.build_all(elements);
        }
        var delimeters = messageObject && messageObject != null && messageObject.delimeters ? messageObject.delimeters : [];
        ServiceDelegator.updateEditorMode($scope.editor, delimeters, $scope.testStep.testContext.format);
        ServiceDelegator.getEditorService($scope.testStep.testContext.format).setEditor($scope.editor);
        ServiceDelegator.getTreeService($scope.testStep.testContext.format).setEditor($scope.editor);
      }
    };
    $scope.clearMessage = function () {
      $scope.nodelay = true;
      $scope.mError = null;
      if ($scope.testStep != null) {
        TestExecutionService.deleteTestStepValidationReport($scope.testStep);
        TestExecutionService.deleteTestStepMessageTree($scope.testStep);
      }
      if ($scope.editor) {
        $scope.editor.doc.setValue('');
        $scope.execute();
      }
    };
    $scope.saveMessage = function () {
      $scope.cb.message.download();
    };
    $scope.parseMessage = function () {
      try {
        if ($scope.testStep != null) {
          if ($scope.cb.message.content != '' && $scope.testStep.testContext != null) {
            $scope.tLoading = true;
            TestExecutionService.deleteTestStepMessageTree($scope.testStep);
            var parsed = ServiceDelegator.getMessageParser($scope.testStep.testContext.format).parse($scope.testStep.testContext.id, $scope.cb.message.content);
            parsed.then(function (value) {
              $scope.tLoading = false;
              $scope.setTestStepMessageTree(value);
            }, function (error) {
              $scope.tLoading = false;
              $scope.tError = error;
              $scope.setTestStepMessageTree([]);
            });
          } else {
            $scope.setTestStepMessageTree([]);
            $scope.tError = null;
            $scope.tLoading = false;
          }
        }
      } catch (error) {
        $scope.tLoading = false;
        $scope.tError = error;
      }
    };
    $scope.onNodeSelect = function (node) {
      ServiceDelegator.getTreeService($scope.testStep.testContext.format).getEndIndex(node, $scope.cb.message.content);
      $scope.cb.cursor.init(node.data, false);
      ServiceDelegator.getEditorService($scope.testStep.testContext.format).select($scope.editor, $scope.cb.cursor);
    };
    $scope.execute = function () {
      if ($scope.tokenPromise) {
        $timeout.cancel($scope.tokenPromise);
        $scope.tokenPromise = undefined;
      }
      $scope.error = null;
      $scope.tError = null;
      $scope.mError = null;
      $scope.vError = null;
      $scope.cb.message.content = $scope.editor.doc.getValue();
      //console.log("message is=" + $scope.editor.doc.getValue());
      $scope.setHasNonPrintableCharacters();
      StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, $scope.cb.message.content);
      $scope.refreshEditor();
      if (!$scope.isTestCase() || !$scope.isTestCaseCompleted()) {
        TestExecutionService.setTestStepExecutionMessage($scope.testStep, $scope.cb.message.content);
        $scope.validateMessage();
        $scope.parseMessage();
      } else {
        $scope.setTestStepValidationReport(TestExecutionService.getTestStepValidationReport($scope.testStep));
        $scope.setTestStepMessageTree(TestExecutionService.getTestStepMessageTree($scope.testStep));
      }
    };
    $scope.executeWithMessage = function (content) {
      if ($scope.editor) {
        $scope.editor.doc.setValue(content);
        $scope.execute();
      }
    };
    $scope.clear = function () {
      $scope.vLoading = false;
      $scope.tLoading = false;
      $scope.mLoading = false;
      $scope.error = null;
      $scope.tError = null;
      $scope.mError = null;
      $scope.vError = null;
      $scope.setTestStepValidationReport(null);
    };
    $scope.removeDuplicates = function () {
      $scope.vLoading = true;
      $scope.$broadcast('cb:removeDuplicates');
    };
    $scope.clear();
    $scope.initCodemirror();
    $scope.$on('cb:refreshEditor', function (event) {
      $scope.refreshEditor();
    });
    $scope.$on('cb:clearEditor', function (event) {
      $scope.clearMessage();
    });
    $rootScope.$on('cb:reportLoaded', function (event, report) {
      if ($scope.testStep != null) {
        TestExecutionService.setTestStepValidationReport($scope.testStep, report);
      }
    });
    $scope.$on('cb:testStepLoaded', function (event, testStep) {
      $scope.clear();
      $scope.testStep = testStep;
      if ($scope.testStep.testContext != null) {
        $scope.cb.editor = ServiceDelegator.getEditor($scope.testStep.testContext.format);
        $scope.cb.editor.instance = $scope.editor;
        $scope.cb.cursor = ServiceDelegator.getCursor($scope.testStep.testContext.format);
        var content = null;
        if (!$scope.isTestCase()) {
          $scope.nodelay = false;
          content = StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY);
        } else {
          $scope.nodelay = true;
          content = TestExecutionService.getTestStepExecutionMessage($scope.testStep);
          if (content == undefined)
            content = '';
        }
        $scope.executeWithMessage(content);
      }
    });
    $scope.$on('cb:removeTestStep', function (event, testStep) {
      $scope.testStep = null;
    });
    $scope.$on('cb:loadEditorContent', function (event, message) {
      $scope.nodelay = true;
      var content = message == null ? '' : message;
      $scope.editor.doc.setValue(content);
      $scope.cb.message.id = null;
      $scope.cb.message.name = '';
      $scope.execute();
    });
    $rootScope.$on('cb:duplicatesRemoved', function (event, report) {
      $scope.vLoading = false;
    });
    $scope.initValidation = function () {
    };
    $scope.expandAll = function () {
      if ($scope.cb.tree.root != null)
        $scope.cb.tree.root.expand_all();
    };
    $scope.collapseAll = function () {
      if ($scope.cb.tree.root != null)
        $scope.cb.tree.root.collapse_all();
    };
    $scope.setHasNonPrintableCharacters = function () {
      $scope.hasNonPrintable = MessageUtil.hasNonPrintable($scope.cb.message.content);
    };
    $scope.showMessageWithHexadecimal = function () {
      var modalInstance = $modal.open({
          templateUrl: 'MessageWithHexadecimal.html',
          controller: 'MessageWithHexadecimalDlgCtrl',
          windowClass: 'valueset-modal',
          animation: false,
          keyboard: true,
          backdrop: true,
          resolve: {
            original: function () {
              return $scope.cb.message.content;
            }
          }
        });
    };
  }
]);
angular.module('cb').controller('CBProfileViewerCtrl', [
  '$scope',
  'CB',
  function ($scope, CB) {
    $scope.cb = CB;
  }
]);
angular.module('cb').controller('CBReportCtrl', [
  '$scope',
  '$sce',
  '$http',
  'CB',
  function ($scope, $sce, $http, CB) {
    $scope.cb = CB;
  }
]);
angular.module('cb').controller('CBVocabularyCtrl', [
  '$scope',
  'CB',
  function ($scope, CB) {
    $scope.cb = CB;
  }
]);
angular.module('cb').controller('PastTestStepConsoleCtrl', [
  '$scope',
  '$modalInstance',
  'title',
  'log',
  function ($scope, $modalInstance, title, log) {
    $scope.title = title;
    $scope.log = log;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.close = function () {
      $modalInstance.close();
    };
  }
]);
angular.module('cb').controller('CurrentTestStepConsoleCtrl', [
  '$scope',
  '$modalInstance',
  'title',
  'logger',
  function ($scope, $modalInstance, title, logger) {
    $scope.title = title;
    $scope.logger = logger;
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.close = function () {
      $modalInstance.close();
    };
  }
]);
angular.module('cb').controller('CBManualValidationCtrl', [
  '$scope',
  'CB',
  '$http',
  'TestExecutionService',
  '$timeout',
  'ManualReportService',
  '$rootScope',
  function ($scope, CB, $http, TestExecutionService, $timeout, ManualReportService, $rootScope) {
    $scope.cb = CB;
    $scope.saving = false;
    $scope.error = null;
    $scope.testStep = null;
    $scope.report = null;
    $scope.testExecutionService = TestExecutionService;
    $scope.saved = false;
    $scope.error = null;
    $scope.$on('cb:manualTestStepLoaded', function (event, testStep) {
      $scope.saved = false;
      $scope.saving = false;
      $scope.error = null;
      $scope.testStep = testStep;
      $scope.report = TestExecutionService.getTestStepValidationReport(testStep) === undefined || TestExecutionService.getTestStepValidationReport(testStep) === null ? {
        'result': {
          'value': '',
          'comments': ''
        },
        'html': null
      } : TestExecutionService.getTestStepValidationReport(testStep);
    });
    $scope.save = function () {
      $scope.saving = true;
      $scope.saved = false;
      $scope.error = null;
      ManualReportService.save($scope.report.result, $scope.testStep).then(function (report) {
        $scope.report['id'] = report.id;
        $scope.report['xml'] = report.xml;
        TestExecutionService.setTestStepExecutionStatus($scope.testStep, 'COMPLETE');
        var rep = angular.copy($scope.report);
        TestExecutionService.setTestStepValidationReport($scope.testStep, rep);
        $timeout(function () {
          $rootScope.$emit('cb:manualReportLoaded', rep, $scope.testStep.id);
        });
        $scope.saving = false;
        $scope.saved = true;
      }, function (error) {
        $scope.error = error;
        $scope.saving = false;
        $scope.saved = false;
      });
    };
  }
]);
angular.module('cb').controller('CBManualReportCtrl', [
  '$scope',
  '$sce',
  '$http',
  'CB',
  function ($scope, $sce, $http, CB) {
    $scope.cb = CB;
  }
]);
'use strict';
/* "newcap": false */
angular.module('account').controller('UserProfileCtrl', [
  '$scope',
  '$resource',
  'AccountLoader',
  'Account',
  'userInfoService',
  '$location',
  'Transport',
  function ($scope, $resource, AccountLoader, Account, userInfoService, $location, Transport) {
    var PasswordChange = $resource('api/accounts/:id/passwordchange', { id: '@id' });
    $scope.accountpwd = {};
    $scope.initModel = function (data) {
      $scope.account = data;
      $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.updateAccount = function () {
      //not sure it is very clean...
      //TODO: Add call back?
      new Account($scope.account).$save().then(function () {
        Transport.init();
      }, function (error) {
      });
      $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.resetForm = function () {
      $scope.account = angular.copy($scope.accountOrig);
    };
    //TODO: Change that: formData is only supported on modern browsers
    $scope.isUnchanged = function (formData) {
      return angular.equals(formData, $scope.accountOrig);
    };
    $scope.changePassword = function () {
      var user = new PasswordChange();
      user.username = $scope.account.username;
      user.password = $scope.accountpwd.currentPassword;
      user.newPassword = $scope.accountpwd.newPassword;
      user.id = $scope.account.id;
      //TODO: Check return value???
      user.$save().then(function (result) {
        $scope.msg = angular.fromJson(result);
      });
    };
    $scope.deleteAccount = function () {
      var tmpAcct = new Account();
      tmpAcct.id = $scope.account.id;
      tmpAcct.$remove(function () {
        //console.log("Account removed");
        //TODO: Add a real check?
        userInfoService.setCurrentUser(null);
        $scope.$emit('event:logoutRequest');
        $location.url('/home');
      });
    };
    /*jshint newcap:false */
    AccountLoader(userInfoService.getAccountID()).then(function (data) {
      $scope.initModel(data);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }, function () {
    });
  }
]);
angular.module('account').controller('UserAccountCtrl', [
  '$scope',
  '$resource',
  'AccountLoader',
  'Account',
  'userInfoService',
  '$location',
  '$rootScope',
  function ($scope, $resource, AccountLoader, Account, userInfoService, $location, $rootScope) {
    $scope.accordi = {
      account: true,
      accounts: false
    };
    $scope.setSubActive = function (id) {
      if (id && id != null) {
        $rootScope.setSubActive(id);
        $('.accountMgt').hide();
        $('#' + id).show();
      }
    };
    $scope.initAccount = function () {
      if ($rootScope.subActivePath == null) {
        $rootScope.subActivePath = 'account';
      }
      $scope.setSubActive($rootScope.subActivePath);
    };
  }
]);
'use strict';
angular.module('account').controller('AccountsListCtrl', [
  '$scope',
  'MultiAuthorsLoader',
  'MultiSupervisorsLoader',
  'Account',
  '$modal',
  '$resource',
  'AccountLoader',
  'userInfoService',
  '$location',
  function ($scope, MultiAuthorsLoader, MultiSupervisorsLoader, Account, $modal, $resource, AccountLoader, userInfoService, $location) {
    //$scope.accountTypes = [{ 'name':'Author', 'type':'author'}, {name:'Supervisor', type:'supervisor'}];
    //$scope.accountType = $scope.accountTypes[0];
    $scope.tmpAccountList = [].concat($scope.accountList);
    $scope.account = null;
    $scope.accountOrig = null;
    $scope.accountType = 'tester';
    $scope.scrollbarWidth = $scope.getScrollbarWidth();
    //        var PasswordChange = $resource('api/accounts/:id/passwordchange', {id:'@id'});
    var PasswordChange = $resource('api/accounts/:id/userpasswordchange', { id: '@id' });
    var ApproveAccount = $resource('api/accounts/:id/approveaccount', { id: '@id' });
    var SuspendAccount = $resource('api/accounts/:id/suspendaccount', { id: '@id' });
    $scope.msg = null;
    $scope.accountpwd = {};
    $scope.updateAccount = function () {
      //not sure it is very clean...
      //TODO: Add call back?
      new Account($scope.account).$save();
      $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.resetForm = function () {
      $scope.account = angular.copy($scope.accountOrig);
    };
    //TODO: Change that: formData is only supported on modern browsers
    $scope.isUnchanged = function (formData) {
      return angular.equals(formData, $scope.accountOrig);
    };
    $scope.changePassword = function () {
      var user = new PasswordChange();
      user.username = $scope.account.username;
      user.password = $scope.accountpwd.currentPassword;
      user.newPassword = $scope.accountpwd.newPassword;
      user.id = $scope.account.id;
      //TODO: Check return value???
      user.$save().then(function (result) {
        $scope.msg = angular.fromJson(result);
      });
    };
    $scope.loadAccounts = function () {
      if (userInfoService.isAuthenticated() && userInfoService.isAdmin()) {
        $scope.msg = null;
        new MultiAuthorsLoader().then(function (response) {
          $scope.accountList = response;
          $scope.tmpAccountList = [].concat($scope.accountList);
        });
      }
    };
    $scope.initManageAccounts = function () {
      $scope.loadAccounts();
    };
    $scope.selectAccount = function (row) {
      $scope.accountpwd = {};
      $scope.account = row;
      $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.deleteAccount = function () {
      $scope.confirmDelete($scope.account);
    };
    $scope.confirmDelete = function (accountToDelete) {
      var modalInstance = $modal.open({
          templateUrl: 'ConfirmAccountDeleteCtrl.html',
          controller: 'ConfirmAccountDeleteCtrl',
          resolve: {
            accountToDelete: function () {
              return accountToDelete;
            },
            accountList: function () {
              return $scope.accountList;
            }
          }
        });
      modalInstance.result.then(function (accountToDelete, accountList) {
        $scope.accountToDelete = accountToDelete;
        $scope.accountList = accountList;
      }, function () {
      });
    };
    $scope.approveAccount = function () {
      var user = new ApproveAccount();
      user.username = $scope.account.username;
      user.id = $scope.account.id;
      user.$save().then(function (result) {
        $scope.account.pending = false;
        $scope.msg = angular.fromJson(result);
      });
    };
    $scope.suspendAccount = function () {
      var user = new SuspendAccount();
      user.username = $scope.account.username;
      user.id = $scope.account.id;
      user.$save().then(function (result) {
        $scope.account.pending = true;
        $scope.msg = angular.fromJson(result);
      });
    };
  }
]);
angular.module('account').controller('ConfirmAccountDeleteCtrl', [
  '$scope',
  '$modalInstance',
  'accountToDelete',
  'accountList',
  'Account',
  function ($scope, $modalInstance, accountToDelete, accountList, Account) {
    $scope.accountToDelete = accountToDelete;
    $scope.accountList = accountList;
    $scope.delete = function () {
      //console.log('Delete for', $scope.accountList[rowIndex]);
      Account.remove({ id: accountToDelete.id }, function () {
        var rowIndex = $scope.accountList.indexOf(accountToDelete);
        if (index !== -1) {
          $scope.accountList.splice(rowIndex, 1);
        }
        $modalInstance.close($scope.accountToDelete);
      }, function () {
      });
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
angular.module('account').controller('ForgottenCtrl', [
  '$scope',
  '$resource',
  '$rootScope',
  function ($scope, $resource, $rootScope) {
    var ForgottenRequest = $resource('api/sooa/accounts/passwordreset', { username: '@username' });
    $scope.requestResetPassword = function () {
      var resetReq = new ForgottenRequest();
      resetReq.username = $scope.username;
      resetReq.$save(function () {
        if (resetReq.text === 'resetRequestProcessed') {
          $scope.username = '';
        }
      });
    };
    $scope.getAppInfo = function () {
      return $rootScope.appInfo;
    };
  }
]);
'use strict';
angular.module('account').controller('RegistrationCtrl', [
  '$scope',
  '$resource',
  '$modal',
  '$location',
  '$rootScope',
  function ($scope, $resource, $modal, $location, $rootScope) {
    $scope.account = {};
    $scope.registered = false;
    $scope.agreed = false;
    //Creating a type to check with the server if a username already exists.
    var Username = $resource('api/sooa/usernames/:username', { username: '@username' });
    var Email = $resource('api/sooa/emails/:email', { email: '@email' });
    var NewAccount = $resource('api/sooa/accounts/register');
    $scope.registerAccount = function () {
      if ($scope.agreed) {
        //console.log("Creating account");
        var acctToRegister = new NewAccount();
        acctToRegister.accountType = 'tester';
        acctToRegister.employer = $scope.account.employer;
        acctToRegister.fullName = $scope.account.fullName;
        acctToRegister.phone = $scope.account.phone;
        acctToRegister.title = $scope.account.title;
        acctToRegister.juridiction = $scope.account.juridiction;
        acctToRegister.username = $scope.account.username;
        acctToRegister.password = $scope.account.password;
        acctToRegister.email = $scope.account.email;
        acctToRegister.signedConfidentialityAgreement = true;
        acctToRegister.$save(function () {
          if (acctToRegister.text === 'userAdded') {
            $scope.account = {};
            //should unfreeze the form
            $scope.registered = true;
            $location.path('/registrationSubmitted');
          } else {
            $scope.registered = false;
          }
        }, function () {
          $scope.registered = false;
        });
        //should freeze the form - at least the button
        $scope.registered = true;
      }
    };
    $scope.getAppInfo = function () {
      return $rootScope.appInfo;
    };
  }
]);
'use strict';
angular.module('account').controller('RegisterResetPasswordCtrl', [
  '$scope',
  '$resource',
  '$modal',
  '$routeParams',
  'isFirstSetup',
  function ($scope, $resource, $modal, $routeParams, isFirstSetup) {
    $scope.agreed = false;
    $scope.displayForm = true;
    $scope.isFirstSetup = isFirstSetup;
    if (!angular.isDefined($routeParams.username)) {
      $scope.displayForm = false;
    }
    if ($routeParams.username === '') {
      $scope.displayForm = false;
    }
    if (!angular.isDefined($routeParams.token)) {
      $scope.displayForm = false;
    }
    if ($routeParams.token === '') {
      $scope.displayForm = false;
    }
    if (!angular.isDefined($routeParams.userId)) {
      $scope.displayForm = false;
    }
    if ($routeParams.userId === '') {
      $scope.displayForm = false;
    }
    //to register an account for the first time
    var AcctInitPassword = $resource('api/sooa/accounts/register/:userId/passwordreset', {
        userId: '@userId',
        token: '@token'
      });
    //to reset the password
    var AcctResetPassword = $resource('api/sooa/accounts/:id/passwordreset', {
        id: '@userId',
        token: '@token'
      });
    $scope.user = {};
    $scope.user.username = $routeParams.username;
    $scope.user.newUsername = $routeParams.username;
    $scope.user.userId = $routeParams.userId;
    $scope.user.token = $routeParams.token;
    //        $scope.confirmRegistration = function() {
    //            var modalInstance = $modal.open({
    //                backdrop: true,
    //                keyboard: true,
    //                backdropClick: false,
    //                controller: 'AgreementCtrl',
    //                templateUrl: 'views/agreement.html'
    //            });
    //            modalInstance.result.then(function (result) {
    //                if(result) {
    //                    var initAcctPass = new AcctInitPassword($scope.user);
    //                    initAcctPass.signedConfidentialityAgreement = true;
    //                    initAcctPass.$save(function() {
    //                        $scope.user.password = '';
    //                        $scope.user.passwordConfirm = '';
    //                    });
    //                }
    //                else {
    //                    //console.log("Agreement not accepted");
    //                }
    //            });
    //        };
    $scope.changePassword = function () {
      if ($scope.agreed) {
        var resetAcctPass = new AcctResetPassword($scope.user);
        resetAcctPass.$save(function () {
          $scope.user.password = '';
          $scope.user.passwordConfirm = '';
        });
      }
    };
  }
]);
/**
 * Created by haffo on 2/13/15.
 */
angular.module('hit-tool-directives').directive('compile', [
  '$compile',
  function ($compile) {
    return function (scope, element, attrs) {
      scope.$watch(function (scope) {
        // watch the 'compile' expression for changes
        return scope.$eval(attrs.compile);
      }, function (value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);
        // compile the new DOM and link it to the current
        // scope.
        // NOTE: we only compile .childNodes so that
        // we don't get into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      });
    };
  }
]);
angular.module('hit-tool-directives').directive('stRatio', function () {
  return {
    link: function (scope, element, attr) {
      var ratio = +attr.stRatio;
      element.css('width', ratio + '%');
    }
  };
});
angular.module('hit-tool-directives').directive('csSelect', function () {
  return {
    require: '^stTable',
    template: '',
    scope: { row: '=csSelect' },
    link: function (scope, element, attr, ctrl) {
      element.bind('change', function (evt) {
        scope.$apply(function () {
          ctrl.select(scope.row, 'single');
        });
      });
      scope.$watch('row.isSelected', function (newValue, oldValue) {
        if (newValue === true) {
          element.parent().addClass('st-selected');
        } else {
          element.parent().removeClass('st-selected');
        }
      });
    }
  };
});
angular.module('hit-tool-directives').directive('mypopover', [
  '$compile',
  '$templateCache',
  function ($compile, $templateCache) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var popOverContent = $templateCache.get('profileInfo.html');
        var options = {
            content: popOverContent,
            placement: 'bottom',
            html: true
          };
        $(element).popover(options);
      }
    };
  }
]);
angular.module('hit-tool-directives').directive('windowExit', [
  '$window',
  '$templateCache',
  '$http',
  'User',
  function ($window, $templateCache, $http, User) {
    return {
      restrict: 'AE',
      compile: function (element, attrs) {
        var myEvent = $window.attachEvent || $window.addEventListener, chkevent = $window.attachEvent ? 'onbeforeunload' : 'beforeunload';
        /// make IE7, IE8 compatable
        myEvent(chkevent, function (e) {
          // For >=IE7, Chrome, Firefox
          $templateCache.removeAll();
        });
      }
    };
  }
]);
angular.module('hit-tool-directives').directive('msg', [function () {
    return {
      restrict: 'EA',
      replace: true,
      link: function (scope, element, attrs) {
        //console.log("Dir");
        var key = attrs.key;
        if (attrs.keyExpr) {
          scope.$watch(attrs.keyExpr, function (value) {
            key = value;
            element.text($.i18n.prop(value));
          });
        }
        scope.$watch('language()', function (value) {
          element.text($.i18n.prop(key));
        });
      }
    };
  }]);
'use strict';
angular.module('account').directive('checkEmail', [
  '$resource',
  function ($resource) {
    return {
      restrict: 'AC',
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        var Email = $resource('api/sooa/emails/:email', { email: '@email' });
        var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        element.on('keyup', function () {
          if (element.val().length !== 0 && EMAIL_REGEXP.test(element.val())) {
            var emailToCheck = new Email({ email: element.val() });
            emailToCheck.$get(function () {
              scope.emailUnique = emailToCheck.text === 'emailNotFound' ? 'valid' : undefined;
              scope.emailValid = EMAIL_REGEXP.test(element.val()) ? 'valid' : undefined;
              if (scope.emailUnique && scope.emailValid) {
                ctrl.$setValidity('email', true);
              } else {
                ctrl.$setValidity('email', false);
              }
            }, function () {
            });
          } else {
            scope.emailUnique = undefined;
            scope.emailValid = undefined;
            ctrl.$setValidity('email', false);
          }
        });
      }
    };
  }
]);
'use strict';
//This directive is used to make sure both passwords match
angular.module('account').directive('checkEmployer', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var employer = '#' + attrs.checkEmployer;
        elem.add(employer).on('keyup', function () {
          scope.$apply(function () {
            //                        console.log('Pass1=', elem.val(), ' Pass2=', $(firstPassword).val());
            var v = elem.val() === $(firstPassword).val();
            ctrl.$setValidity('noMatch', v);
          });
        });
      }
    };
  }]);
'use strict';
//This directive is used to make sure both passwords match
angular.module('account').directive('checkPassword', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.checkPassword;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            //                        console.log('Pass1=', elem.val(), ' Pass2=', $(firstPassword).val());
            var v = elem.val() === $(firstPassword).val();
            ctrl.$setValidity('noMatch', v);
          });
        });
      }
    };
  }]);
'use strict';
angular.module('account').directive('checkPhone', [function () {
    return {
      restrict: 'AC',
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        var NUMBER_REGEXP = /[0-9]*/;
        element.on('keyup', function () {
          if (element.val() && element.val() != null && element.val() != '') {
            scope.phoneIsNumber = NUMBER_REGEXP.test(element.val()) && element.val() > 0 ? 'valid' : undefined;
            scope.phoneValidLength = element.val().length >= 7 ? 'valid' : undefined;
            if (scope.phoneIsNumber && scope.phoneValidLength) {
              ctrl.$setValidity('phone', true);
            } else {
              ctrl.$setValidity('phone', false);
            }
          } else {
            scope.phoneIsNumber = undefined;
            scope.phoneValidLength = undefined;
            ctrl.$setValidity('phone', true);
          }
        });
      }
    };
  }]);
'use strict';
angular.module('account').directive('checkPoaDate', [function () {
    return {
      replace: true,
      link: function (scope, elem, attrs, ctrl) {
        var startElem = elem.find('#inputStartDate');
        var endElem = elem.find('#inputEndDate');
        var ctrlStart = startElem.inheritedData().$ngModelController;
        var ctrlEnd = endElem.inheritedData().$ngModelController;
        var checkDates = function () {
          var sDate = new Date(startElem.val());
          var eDate = new Date(endElem.val());
          if (sDate < eDate) {
            //console.log("Good!");
            ctrlStart.$setValidity('datesOK', true);
            ctrlEnd.$setValidity('datesOK', true);
          } else {
            //console.log(":(");
            ctrlStart.$setValidity('datesOK', false);
            ctrlEnd.$setValidity('datesOK', false);
          }
        };
        startElem.on('change', checkDates);
        endElem.on('change', checkDates);
      }
    };
  }]);
'use strict';
//This directive is used to make sure the start hour of a timerange is < of the end hour
angular.module('account').directive('checkTimerange', [function () {
    return {
      replace: true,
      link: function (scope, elem, attrs, ctrl) {
        //elem is a div element containing all the select input
        //each one of them has a class for easy selection
        var myElem = elem.children();
        var sh = myElem.find('.shour');
        var sm = myElem.find('.sminute');
        var eh = myElem.find('.ehour');
        var em = myElem.find('.eminute');
        var ctrlSH, ctrlSM, ctrlEH, ctrlEM;
        ctrlSH = sh.inheritedData().$ngModelController;
        ctrlSM = sm.inheritedData().$ngModelController;
        ctrlEH = eh.inheritedData().$ngModelController;
        ctrlEM = em.inheritedData().$ngModelController;
        var newnew = true;
        var checkTimeRange = function () {
          if (newnew) {
            //We only do that once to set the $pristine field to false
            //Because if $pristine==true, and $valid=false, the visual feedback
            //are not displayed
            ctrlSH.$setViewValue(ctrlSH.$modelValue);
            ctrlSM.$setViewValue(ctrlSM.$modelValue);
            ctrlEH.$setViewValue(ctrlEH.$modelValue);
            ctrlEM.$setViewValue(ctrlEM.$modelValue);
            newnew = false;
          }
          //Getting a date object
          var tmpDate = new Date();
          //init the start time with the dummy date
          var startTime = angular.copy(tmpDate);
          //init the end time with the same dummy date
          var endTime = angular.copy(tmpDate);
          startTime.setHours(sh.val());
          startTime.setMinutes(sm.val());
          endTime.setHours(eh.val());
          endTime.setMinutes(em.val());
          if (startTime < endTime) {
            //console.log("Excellent!");
            ctrlSH.$setValidity('poaOK', true);
            ctrlSM.$setValidity('poaOK', true);
            ctrlEH.$setValidity('poaOK', true);
            ctrlEM.$setValidity('poaOK', true);
          } else {
            //console.log("Bad... :(");
            ctrlSH.$setValidity('poaOK', false);
            ctrlSM.$setValidity('poaOK', false);
            ctrlEH.$setValidity('poaOK', false);
            ctrlEM.$setValidity('poaOK', false);
          }
        };
        sh.on('change', checkTimeRange);
        sm.on('change', checkTimeRange);
        eh.on('change', checkTimeRange);
        em.on('change', checkTimeRange);
      }
    };
  }]);
'use strict';
angular.module('account').directive('checkUsername', [
  '$resource',
  function ($resource) {
    return {
      restrict: 'AC',
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        var Username = $resource('api/sooa/usernames/:username', { username: '@username' });
        element.on('keyup', function () {
          if (element.val().length >= 4) {
            var usernameToCheck = new Username({ username: element.val() });
            //var delay = $q.defer();
            usernameToCheck.$get(function () {
              scope.usernameValidLength = element.val() && element.val().length >= 4 && element.val().length <= 20 ? 'valid' : undefined;
              scope.usernameUnique = usernameToCheck.text === 'usernameNotFound' ? 'valid' : undefined;
              if (scope.usernameValidLength && scope.usernameUnique) {
                ctrl.$setValidity('username', true);
              } else {
                ctrl.$setValidity('username', false);
              }
            }, function () {
            });
          } else {
            scope.usernameValidLength = undefined;
            scope.usernameUnique = undefined;
            ctrl.$setValidity('username', false);
          }
        });
      }
    };
  }
]);
'use strict';
//This directive is used to check password to make sure they meet the minimum requirements
angular.module('account').directive('passwordValidate', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function (viewValue) {
          scope.pwdValidLength = viewValue && viewValue.length >= 7 ? 'valid' : undefined;
          scope.pwdHasLowerCaseLetter = viewValue && /[a-z]/.test(viewValue) ? 'valid' : undefined;
          scope.pwdHasUpperCaseLetter = viewValue && /[A-Z]/.test(viewValue) ? 'valid' : undefined;
          scope.pwdHasNumber = viewValue && /\d/.test(viewValue) ? 'valid' : undefined;
          if (scope.pwdValidLength && scope.pwdHasLowerCaseLetter && scope.pwdHasUpperCaseLetter && scope.pwdHasNumber) {
            ctrl.$setValidity('pwd', true);
            return viewValue;
          } else {
            ctrl.$setValidity('pwd', false);
            return undefined;
          }
        });
      }
    };
  }]);