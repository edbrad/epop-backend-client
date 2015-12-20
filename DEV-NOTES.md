# Development Notes

## Development Environment & Tools

- OS - Linux (Linux Mint)
- Code Editor - Visual Studio Code

## Major Components & Libraries

- Yeoman (http://yeoman.io) - Angular code generator (HotTowel)
- Angular HotTowel Template (https://github.com/johnpapa/generator-hottowel) - Open Source SPA Generator from John Papa
- GIT - source control
- Gulp - Javascript Task Runner
- TypeScript Definition Manager - TSD (VSCode Node/Express Intellisense)

## Preparation

## Node Package Manger (NPM) - Global Libraries

- Yeoman
```
$ npm install -g yo
```

- Gulp
```
$ npm install -g gulp
```

- Typescript Definition Manager
```
$ npm install -g tsd
```

### GIT initialization

```

$ git init

```

### Visual Studio Code Node/Express (loopback) Intellisense support (via typscript)

```
$ tsd query node express --action install

```
### HotTowel Template Customization

**Add Menu Items and screens**

- /src/client/app/app.module.js

```javascript


angular.module('app', [
        'app.core',
        'app.widgets',
        'app.admin',
        'app.dashboard',
        'app.mailOwners' // [Menu Item]
        ] 
		
```
The code for each side navigation screen is encapsulated in a subfolder

```
/src
  |__/client
        |__/app
             |__/[Menu Item]
                    |__[Menu Item]controller.js
                    |__[Menu Item]controller.spec.js
                    |__[Menu Item].html
                    |__[Menu Item].module.js
                    |__[Menu Item].route.js
                    |__[Menu Item].route.spec.js

```

**Add LoopBack API Data Access (lb-services)***

The Angular LoopBack API Service Javascript code is generated in the API server project (**epop-backend**) using the LoopBack Yeoman Generator (lb-ng):

```
$ cd client
$ mkdir js
$ lb-ng ../server/server.js js/lb-services.js

```
The generated code (lb-services.js) is then copied/pasted into this project's /client/app/core folder and a reference is automatically injected in the index.html, via the Gulp **inject** task:

```
<!-- inject:js -->
...
<script src="/src/client/app/core/lb-services.js"></script>
...
<!-- endinject -->
```    

Add the dependency (lbServices) to the given module:

```
.module('app.mailOwners', ['lbServices'])

```

Inject the needed Entity service into the controller (**MailOwner** Entity in the example bellow):

```javascript
MailOwnersController.$inject = ['$q', 'MailOwner', 'logger', '$scope'];
    /* @ngInject */
    function MailOwnersController($q, MailOwner, logger, $scope) {
            ...
    }

```

Call the Angular LoopBack API service (**find** method), during activation, to retrieve the Entity items from the backend database (**MongoDB**).  The API calls are asyncronus (via $q promise):


```javascript

        function activate() {
            var promises = [getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owners View');
            });
        }
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                    $scope.gridOptions.data = result;
                });
        }
``` 
       
**Use UI-Grid (from the Angular-UI companion library - http://ui-grid.info/) to display Entity items**

Install the Angular UI-Grid libary:

```
$ bower install --save angular-ui-grid

```

Add the dependencies to the given module:

```
.module('app.mailOwners', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns'])

```

Add the UI-Grid directive to the template HTML (options: *pagination, resize columns*):

```html

            <div class="row">
                <div class="col-md-12">
                    <div class="widget wlightblue">
                    <div ht-widget-header title="Mail Owners" allow-collapse="true"></div>
                        <div class="widget-content text-left text-info">
                            <p><strong>USPS Registered Mail Owners</strong></p>
                            <div ui-grid="gridOptions" ui-grid-pagination  ui-grid-resize-columns class="grid"></div>
                        </div>
                    </div>
                </div>
            </div>
            
```

The **gridOptions** object is included in the controller to manage the grid rendering (*I was forced to use $scope instead of vm - not sure about the requirement - will look into it*):

```javascript

 $scope.gridOptions = {
            paginationPageSizes: [25, 75, 100],
            columnDefs:[
                {name: 'Name'},
                {name: 'Address1'},
                {name: 'Address2'},
                {name: 'City' },
                {name: 'State'},
                {name: 'Zip5' }
            ],
            enableGridMenu: true,
            enableFiltering: true
        };

```

The data binding is implemented via the **data** property:

```javascript

$scope.gridOptions.data = result;

```

**IMPORTANT:** CSS must be added for the grid width in order for it to display:

```css

/*
 * Component: UI-Grid
 * --------------
 */
 .grid{
     width: 100%;
     
 }

```

To resolve data from a related Entity (e.g. get the Mail Owner Name from the Id), use the cellTemplate property. The function to resolve the data is also defined in the controller:

```javascript
columnDefs:[
        {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Mail Owner Name',
        cellTemplate: '<div style="padding: 5px;">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</div>'},
...

$scope.getMailOwnerName = function(id){
    for(var i = 0 ; i < vm.MailOwners.length; i++){
        var obj = vm.MailOwners[i];
        if (obj.id == id){
            return obj.Name;
        }
    }
};

```

**IMPORTANT:** The HTML directive must also include the **external-scopes** parameter to access the relation resolver function:

```html

<div ui-grid="gridOptions" ui-grid-pagination  ui-grid-resize-columns external-scopes="states" class="grid"></div>

```