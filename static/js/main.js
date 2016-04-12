function myOnLoadEvent(func) {
    // assign any pre-defined functions on 'window.onload' to a variable
    var oldOnLoad = window.onload;
    // if there is not any function hooked to it
    if (typeof window.onload != 'function') {
        // you can hook your function with it
        window.onload = func
    } else { // someone already hooked a function
        window.onload = function () {
            // call the function hooked already
            oldOnLoad();
            // call your awesome function
            func();
        }
    }
}

// pass the function you want to call at 'window.onload', in the function defined above
myOnLoadEvent(function(){
    // your awesome code to run on window.onload
    //document.getElementById('navimage').addEventListener('click', function(){
    //    console.log("snap");
    //});
    //console.log("window loaded");



    document.getElementById('appOverlayMenu').style.top = '-100%';

    var snapper = new Snap({
      element: document.getElementById('content')
    });


    document.getElementById('navicon').addEventListener('click', function(){
        console.log("snap");
        if( snapper.state().state=="left" ){
            snapper.close();
        } else {
            snapper.open('left');
        }
    });

    document.getElementById('navimage').addEventListener('click', function(){
        console.log("snap");
        if( snapper.state().state=="left" ){
            snapper.close();
        } else {
            snapper.open('left');
        }

    });

    document.getElementById('rightNavToggle').addEventListener('click', function(){
        console.log("snap");
        if( snapper.state().state=="right" ){
            snapper.close();
        } else {
            snapper.open('right');
        }
    });


    var container = document.getElementById('leftMenu');
    Ps.initialize(container);


});


function showNav(){
  snapper.open('left');
}


function dropExpand(e){
  var x = document.getElementById(e).style.display;
  console.log(x)
  if (x == 'block'){
    document.getElementById(e).style.display = 'none';
  } else{
    document.getElementById(e).style.display = 'block';
  }
}

function dropExpandInline(e){
  var x = document.getElementById(e).style.display;
  console.log(x)
  if (x == 'inline-block'){
    document.getElementById(e).style.display = 'none';
  } else{
    document.getElementById(e).style.display = 'inline-block';
  }
}


/***********************************************************************
angular
***********************************************************************/

;(function(){
function authInterceptor(API, auth, $location, $rootScope) {
  console.log($rootScope);

  return {
    // automatically attach Authorization header
    request: function(config) {
      var token = auth.getToken();
      if(token ) {
        //config.headers.Authorization = 'Bearer ' + token;
        config.headers['X-AUTH-TOKEN'] = token;
      }
      return config;
    },

    // If a token was sent back, save it
    response: function(res) {
      if(res.config.url.indexOf(API) === 0 && res.data.token) {
        auth.saveToken(res.data.token);
      }

      return res;
    }

  }
}

function authService($window) {
  var self = this;

    self.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    }

    self.saveToken = function(token) {
      $window.localStorage['jwtToken'] = token;
    }

    self.getToken = function() {
      return $window.localStorage['jwtToken'];
    }

    self.isAuthed = function() {
      var token = self.getToken();
      if(token) {
        var params = self.parseJwt(token);
        return Math.round(new Date().getTime() / 1000) <= params.exp;
      } else {
        return false;
      }
    }

    self.logout = function() {
      $window.localStorage.removeItem('jwtToken');
    }
  // Add JWT methods here
}

function userService($http, API, auth) {
  var self = this;
  self.details = function() {
    return $http.get(API + '/me')
  }

  self.register = function(username, password) {
  return $http.post(API + '/auth/register', {
      username: username,
      password: password
    })
  }

  self.login = function(username, password, remember) {
  return $http.post(API + '/auth/login', {
      username: username,
      password: password,
      remember: remember,
    })
  };


  // add authentication methods here

}

function RootCtrl(auth,user,$rootScope, $state) {
  var self = this;
  console.log("roor ctrl");
  function handleRequest(res) {
    console.log(res)
    self.user = res.data;
    document.getElementById('loader-wrapper').classList.add("loaded");
  }

  function handleError(err){
    console.log("Error")
    console.log(err)
    document.getElementById('loader-wrapper').classList.add("loaded");
  }


  user.details().then(handleRequest, handleError)

    self.logout = function() {
      console.log("log out");
      auth.logout && auth.logout();
      $state.go("login")
    }
    self.isAuthed = function() {
      return auth.isAuthed ? auth.isAuthed() : false
    }
}


/**************************************
LoginCtrl
***************************************/
function LoginCtrl(user, auth, $state, $rootScope) {
  var self = this;
  self.remember = false;
  console.log("login ");



  function handleRequest2(res) {
    console.log(res)
    $rootScope.user = res.data;

  }

  function handleError2(err){
    console.log("Error")
    console.log(err)
  }




  function handleRequest(res) {
    console.log(res)
    var token = res.data.token ? res.data.token : null;
    if(token) {
      console.log('JWT:', token);
      $state.go("root");
      user.details().then(handleRequest2, handleError2);
    }

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }

  self.login = function() {
    user.login(self.username, self.password, self.remember)
      .then(handleRequest, handleError)
  }

  self.logout = function() {
    auth.logout && auth.logout()
  }
  self.isAuthed = function() {
    return auth.isAuthed ? auth.isAuthed() : false
  }
}

/****
Class
****/

function NewClassCtrl(API, $http, $scope) {
  console.log("new class");
  $scope.c = {};
  $scope.c.teachers = [];

  $http.get(API + '/class').then(function(res) {
    console.log(res)
    $scope.classes = res.data.classes;

  }, function(err){
    console.log("Error")
    console.log(err)
  });


  function handleRequest(res) {
    console.log(res)
    $scope.c = {};

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $scope.newclass = function(c){
    console.log(c);
    $http.post(API + '/class', c).then(handleRequest, handleError)
  }
}


function ClassListCtrl(API, $scope, $http, $state, $rootScope) {
  console.log("class list ctrl");
  $scope.c = $rootScope.c;
  function handleRequest(res) {
    console.log(res)
    $scope.classes = res.data.classes;

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $http.get(API + '/class').then(handleRequest, handleError);

  $scope.edit = function(cl){
    console.log("edit");
    console.log(cl);
    $rootScope.c = cl;
    $state.go("class.edit")
  }
}


function EditClassCtrl(API, $scope, $http, $state, $rootScope) {
  console.log("edit class ctrl");
  $scope.c = $rootScope.c;
  function handleRequest(res) {
    console.log(res)
    $scope.c = {};
    $state.go("class.list")

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $scope.editclass = function(c){
    console.log(c);
    $http.put(API + '/class', c).then(handleRequest, handleError)
  }


  $http.get(API + '/class').then(function(res) {
    console.log(res)
    $scope.classes = res.data.classes;

  }, function(err){
    console.log("Error")
    console.log(err)
  });

}



/****************************************************
Subject
*****************************************************/

function NewSubjectCtrl(API, $http, $scope) {
  console.log("new subject");
  $scope.subject = {};
  $scope.subject.teachers = [];


  $http.get(API + '/class').then(function(res) {
    console.log(res)
    $scope.classes = res.data.classes;

  }, function(err){
    console.log("Error")
    console.log(err)
  });


  function handleRequest(res) {
    console.log(res)
    $scope.subject = {};

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $scope.newsubject = function(c){
    console.log(c);
    $http.post(API + '/subject', c).then(handleRequest, handleError)
  }
}


function SubjectListCtrl(API, $scope, $http, $state, $rootScope) {
  console.log("subject list ctrl");
  $scope.subject = $rootScope.subject;
  function handleRequest(res) {
    console.log(res)
    $scope.subjects = res.data.subjects;

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $http.get(API + '/subject').then(handleRequest, handleError);

  $scope.edit = function(sub){
    console.log("edit");
    console.log(sub);
    $rootScope.subject = sub;
    $state.go("class.subject_edit")
  }
}


function EditSubjectCtrl(API, $scope, $http, $state, $rootScope) {
  console.log("edit subject ctrl");
  $scope.subject = $rootScope.subject;

  $http.get(API + '/class').then(function(res) {
    console.log(res)
    $scope.classes = res.data.classes;

  }, function(err){
    console.log("Error")
    console.log(err)
  });


  function handleRequest(res) {
    console.log(res)
    $scope.subject = {};
    $state.go("class.subject_list")

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $scope.editsubject = function(subject){
    console.log(subject);
    $http.put(API + '/subject', subject).then(handleRequest, handleError)
  }
}


/**********************************************************
staff
**********************************************************/

function NewStudentCtrl(API, $http, $scope) {
  console.log("new staff");

  $scope.steps = [
    {
        templateUrl: '/partials/students/students_new_official.html',
        title: 'Official Details',
        hasForm: true,
    },
    {
        templateUrl: '/partials/students/students_new_personal.html',
        title: 'Personal Details',
        hasForm: true,
    },
    {
        templateUrl: '/partials/students/students_new_contacts.html',
        title: 'Contact Details',
        hasForm: true,
    },
    {
        templateUrl: '/partials/students/students_new_guardians.html',
        title: 'Guardian Details',
        hasForm: true,
    },
    {
        templateUrl: '/partials/students/students_new_previousqualification.html',
        title: 'Previous Qualification Details',
        hasForm: true,

    }
];

  $scope.student = {};
  function handleRequest(res) {
    console.log(res)
    $scope.student = {};
    $scope.submittedStudent = false;
  }

  function handleError(err){
    console.log("Error")
    console.log(err)
    $scope.submittedStudent = false;
  }


  $scope.newstudent = function(student){
    $scope.submittedStudent = true;
    $http.post(API + '/student', student).then(handleRequest, handleError)
  }
}

function StudentListCtrl(API, $scope, $rootScope, $state, $http) {
  console.log("students list ctrl");
  function handleRequest(res) {
    console.log(res)

    var students = res.data.students;
    $scope.students = students;


  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $http.get(API + '/student').then(handleRequest, handleError)

  $scope.edit = function(student){
    console.log("edit");
    console.log(student);
    $rootScope.student = student;
    $state.go("students.edit")
  }
}


function EditStudentCtrl(API, $scope, $http, $state, $rootScope) {
  console.log("edit staff ctrl");


    $scope.steps = [
      {
          templateUrl: '/partials/students/students_new_official.html',
          title: 'Official Details',
          hasForm: true,
      },
      {
          templateUrl: '/partials/students/students_new_personal.html',
          title: 'Personal Details',
          hasForm: true,
      },
      {
          templateUrl: '/partials/students/students_new_contacts.html',
          title: 'Contact Details',
          hasForm: true,
      },
      {
          templateUrl: '/partials/students/students_new_guardians.html',
          title: 'Guardian Details',
          hasForm: true,
      },
      {
          templateUrl: '/partials/students/students_new_previousqualification.html',
          title: 'Previous Qualification Details',
          hasForm: true,

      }
  ];




  $scope.student = $rootScope.student;

  $scope.student.dateofbirth = new Date($scope.student.dateofbirth);
  $scope.student.signupdate = new Date($scope.student.signupdate);
  function handleRequest(res) {
    console.log(res)
    $scope.student = {};
    $state.go("students.list")

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $scope.newstudent = function(student){
    console.log(student);
    $http.put(API + '/student', student).then(handleRequest, handleError)
  }
}


/**********************************************************
staff
**********************************************************/

function NewStaffCtrl(API, $http, $scope) {
  console.log("new staff");
  $scope.newstaff = {};
  function handleRequest(res) {
    console.log(res)
    $scope.newstaff = {};

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $scope.newstaffx = function(staff){
    $http.post(API + '/staff', staff).then(handleRequest, handleError)
  }
}

function StaffListCtrl(API, $scope, $rootScope, $state, $http) {
  console.log("staff list ctrl");
  function handleRequest(res) {
    console.log(res)
    $scope.staff = res.data.users;

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $http.get(API + '/staff').then(handleRequest, handleError)

  $scope.edit = function(staff){
    console.log("edit");
    console.log(staff);
    $rootScope.staff = staff;
    $state.go("staff.edit")
  }
}


function EditStaffCtrl(API, $scope, $http, $state, $rootScope) {
  console.log("edit staff ctrl");
  $scope.staff = $rootScope.staff;
  function handleRequest(res) {
    console.log(res)
    $scope.staff = {};
    $state.go("staff.list")

  }

  function handleError(err){
    console.log("Error")
    console.log(err)
  }


  $scope.editstaff = function(staff){
    console.log(staff);
    $http.put(API + '/staff', staff).then(handleRequest, handleError)
  }
}


var edna = angular.module('edna', ['ui.router', 'multiStepForm']);
edna.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/404");
  //
  // Now set up the states
  $stateProvider
    .state('404', {
      url: "/404",
      views: {
        "body": { templateUrl: "/partials/404.html" },
      },data:{
        roles: [],
        requireLogin: false,
      }
    })
    .state('root', {
      url: "/",
      views: {
        "content": { templateUrl: "/partials/dashboard.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })

    .state('root2', {
      url: "",
      views: {
        "content": { templateUrl: "/partials/dashboard.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })

    .state('staff', {
      views: {
        "content": { templateUrl: "/partials/staff/staff.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('staff.new', {
      url: "/staff/new",
      views: {
        "staff": { templateUrl: "/partials/staff/staff_new.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('staff.list', {
      url: "/staff/list",

      views: {
        "staff": { templateUrl: "/partials/staff/staff_list.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('staff.edit', {
      url: "/staff/edit",

      views: {
        "staff": { templateUrl: "/partials/staff/staff_edit.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('students', {
      views: {
        "content": { templateUrl: "/partials/students/students.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('students.new', {
      url: "/students/new",
      views: {
        "students": { templateUrl: "/partials/students/students_new.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('students.list', {
      url: "/students/list",

      views: {
        "students": { templateUrl: "/partials/students/students_list.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('students.edit', {
      url: "/students/edit",

      views: {
        "students": { templateUrl: "/partials/students/students_edit.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('class', {
      url: "",
      views: {
        "content": { templateUrl: "/partials/class/class.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('class.new', {
      url: "/class/new",
      views: {
        "class": { templateUrl: "/partials/class/class_new.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('class.list', {
      url: "/class/list",
      views: {
        "class": { templateUrl: "/partials/class/class_list.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('class.edit', {
      url: "/class/edit",
      views: {
        "class": { templateUrl: "/partials/class/class_edit.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('class.subject_new', {
      url: "/class/subjects/new",
      views: {
        "class": { templateUrl: "/partials/subject/subject_new.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('class.subject_list', {
      url: "/class/subjects/list",
      views: {
        "class": { templateUrl: "/partials/subject/subject_list.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('class.subject_edit', {
      url: "/class/subjects/edit",
      views: {
        "class": { templateUrl: "/partials/subject/subject_edit.html" },
      },data:{
        roles: [],
        requireLogin: true,
      }
    })
    .state('login', {
      url: "/login",
      views: {
        "body": { templateUrl: "/partials/login.html" },
      },
      data:{
        roles: [],
        requireLogin: false,
      }
    });
  });


  edna.factory('authInterceptor', authInterceptor)
  .service('user', userService)
  .service('auth', authService)
  .constant('API', '/api')
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  })
  .run(function($rootScope, $state, auth){

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams){
      console.log(auth.isAuthed())
      var requireLogin = toState.data.requireLogin;

      if (requireLogin && !auth.isAuthed()){
        event.preventDefault();
        $state.go('login')
      }
    })
  })
  .controller('LoginCtrl', LoginCtrl)
  .controller('RootCtrl', RootCtrl)

  .controller('NewStaffCtrl', NewStaffCtrl)
  .controller('EditStaffCtrl', EditStaffCtrl)
  .controller('StaffListCtrl', StaffListCtrl)

  .controller('NewStudentCtrl', NewStudentCtrl)
  .controller('EditStudentCtrl', EditStudentCtrl)
  .controller('StudentListCtrl', StudentListCtrl)

  .controller('NewClassCtrl', NewClassCtrl)
  .controller('EditClassCtrl', EditClassCtrl)
  .controller('ClassListCtrl', ClassListCtrl)

  .controller('NewSubjectCtrl', NewSubjectCtrl)
  .controller('EditSubjectCtrl', EditSubjectCtrl)
  .controller('SubjectListCtrl', SubjectListCtrl);

})();
