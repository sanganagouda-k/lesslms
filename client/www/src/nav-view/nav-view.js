import { html, PolymerElement } from '../../node_modules/@polymer/polymer/polymer-element.js';
import { getData_L, getData, getId } from '../lesslms-frontend-app/lesslms-common.js';
import '../../node_modules/@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-spinner/paper-spinner-lite.js';
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/iron-icons/iron-icons.js';
import '../form-selector/form-selector.js';
import '../nav-card/nav-card.js';

/**
 * `nav-view`
 * View to display lesslms contents
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

const _addTypeMap = {
    default: [],
    root: [{ type: 'course', max: -1 }],
    course: [{ type: 'content', max: 1 }, { type: 'definition', max: 1 }],
    definition: [],
    content: [{ type: 'topic', max: -1 }, { type: 'evaluation', max: 1 }],
    topic: [{ type: 'chapter', max: -1 }, { type: 'evaluation', max: 1 }],
    chapter: [{ type: 'evaluation', max: 1 }],
    evaluation: [{ type: 'question', max: -1 }],
    question: [{ type: 'solution', max: 1 }],
    solution: []
};

class NavView extends PolymerElement {
    ready() {
        super.ready();
        document.addEventListener('add', (e) => { this._onAdd(e) });
        document.addEventListener('edit', (e) => { this._onEdit(e) });
        this._reload = false;
        this._location = [];
    }
    static get template() {
        return html `
      <style is="custom-style" include="iron-flex iron-flex-alignment"></style>  
      <style>
        :host {
          display: block;
          --header-buttons-display: block;
        }

        paper-icon-button {
          color: var(--paper-blue-700);         
        }

        .wrapper {
          margin: 0 auto;
          padding: 7px;
          width: 100%;
          width: calc(100% - 32px);
          height: calc(100vh - 32px);          
        }

        .wrapper * {
            background-color: white;    
        }

        .wrapper header{
          height: 64px;          
          border: 1px transparent;                    
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }

        div.container{
          width: calc(100% - 200px);
        }

        div.top{
          text-align: center;
        }

        div.top h3 {
          margin: 0;
          padding: 0;
        }

        div.bot{
          text-align: center;
        }

        paper-button {
          background-color: var(--paper-blue-700) !important;
          text-align: center;
          color: white;
        }

        section {
          margin: 10px 0 0 0;
          height: calc(100% - 74px);          
          border: 1px transparent;                    
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }

        form-selector {
          width: 70%;
          height: 100%;
        }

        div.card{
          width: 30%;
          height: calc(100% - 14px);     
          padding: 7px;    
          overflow: scroll; 
        }

        nav-card {          
          margin: 7px;
          width: 100%;
        }

        .header-buttons {
          display: var(--header-buttons-display);
        }

      </style>
      <div class="wrapper">
        <header class="layout horizontal center-center">
          <paper-icon-button icon="arrow-back" class="header-buttons" on-click="_onBack"></paper-icon-button>
          <div class="container">
            <div class="top">
            <h3>[[type]]</h3>
            </div>
            <div class="bot">
            [[_path]]
            </div>            
          </div>
          <paper-button class="header-buttons" on-click="_onSave">SAVE</paper-button>
          <paper-icon-button icon="refresh" on-click="_onReload"></paper-icon-button>
          <paper-spinner-lite id="spinner_id"></paper-spinner-lite>
        </header>
        <section class="layout horizontal center-center">
          <form-selector id="form_id" type="[[type]]"></form-selector>
          <div class="card layout vertical">            
            <p>Number of elements: [[_cardCount]]</p>
            <dom-repeat items="[[_cardData]]" filter="_dataFilter">
            <template>
              <nav-card 
                type="[[item.type]]",
                title="[[item.title]]", 
                id="[[item.id]]"></nav-card>
            </template>
            </dom-repeat>
            <dom-repeat items="[[_addData]]">
            <template>
              <nav-card 
                type="[[item.type]]" 
                add></nav-card>            
            </template>
            </dom-repeat>

          </div>
        </section>
      </div>
      <iron-ajax id="ajax_id"
      method=""  
      url=""      
      contentType="application/json"
      handle-as="json"
      on-response="_handleResponse"
      debounce-duration="300">
      </iron-ajax>
    `;
    }
    static get properties() {
        return {
            type: {
                type: String,
                value: 'default',
                observer: '_onTypeChange'
            },
            path: {
                type: Array,
                value: []
            },
            _path: {
                type: String,
                value: '/'
            },
            _cardData: {
                type: Array,
                value: []
            },
            _addData: {
                type: Array,
                value: []
            },
            _currentData: {
                type: Object,
                value: {}
            },
            _currentId: {
                type: String,
                value: '',
                observer: '_onIdChange'
            },
            _cardCount: {
                type: Number,
                value: 0,
                observer: '_onCountChange'
            }
        };
    }

    initialLoad() {
        let _credentials = getData('credentials');
        this._updateLocation(_credentials.email, _credentials.email);
        this._updatePath('push', _credentials.email);
        this._fetchData({ id: _credentials.email });
    }

    _onTypeChange(val) {
        if (val == 'root') {
            this.updateStyles({ '--header-buttons-display': 'none' })
        } else {
            this.updateStyles({ '--header-buttons-display': 'block' })
        }
    }

    _onIdChange(val) {
        console.log('_onIdChange(val)', val);
    }

    _onPathChange(val) {
        console.log('_onPathChange(val)', val);
    }

    _updatePath(action, path) {
        switch (action) {
            case 'push':
                this.path.push(path);
                break;

            case 'pop':
                this.path.pop();
                this.path.pop();
                break;
        }

        let _p = '';
        for (let p of this.path) {
            _p += ('/' + p);
        }
        this._path = _p;
        console.log('_updatePath(action, path)', action, path, this.path);
    }

    _updateLocation(current) {
        if (this._location[this._location.length - 1] != current) {
            this._location.push(new String(current));
        }
        console.log('_______________________updateLocation(current)', current, this._location);
    }

    _getPreviousLocation() {
        this._location.pop();
        let _r = this._location[this._location.length - 1];
        console.log('________________________getPreviousLocation(<< _r)', _r);
        return _r;
    }

    _fetchData(params) {
        console.log('_fetchData(params)', params);
        let _credentials = getData('credentials');
        this.$.ajax_id.url = getData_L('uri') + 'lms/fetch';
        this.$.ajax_id.method = 'GET';
        this.$.ajax_id.body = {};
        this.$.ajax_id.headers['accessToken'] = _credentials.accessToken;
        this.$.ajax_id.params = params;

        //OSLL: Clean up card display.
        this._cardCount = 0;
        this._cardData = [];
        this._addData = [];
        this.$.ajax_id.generateRequest();
        this.$.spinner_id.active = true;
    }

    _addCourse(name) {
        console.log('_addCourse(name)', name);
        let _credentials = getData('credentials');
        this.$.ajax_id.url = getData_L('uri') + 'lms/add';
        this.$.ajax_id.method = 'POST';
        this.$.ajax_id.headers['accessToken'] = _credentials.accessToken;
        this.$.ajax_id.body = JSON.stringify({
            name: name,
            user: _credentials.email,
            profile: _credentials.profile,
            id: getId('course')
        });
        this.$.ajax_id.generateRequest();
        this.$.spinner_id.active = true;
    }

    _saveData(data) {
        console.log('_saveData(data)', data);
        let _credentials = getData('credentials');
        this.$.ajax_id.url = getData_L('uri') + 'lms/update';
        this.$.ajax_id.method = 'POST';
        this.$.ajax_id.headers['accessToken'] = _credentials.accessToken;
        this.$.ajax_id.body = JSON.stringify(data);
        this.$.ajax_id.params = {};
        this.$.ajax_id.generateRequest();
        this.$.spinner_id.active = true;
    }

    _handleResponse(e) {
        console.log('_handleResponse(response)', e.detail.response);
        this.$.spinner_id.active = false;
        switch (e.detail.response.path) {
            case '/lms/fetch':
                this._currentData = e.detail.response;
                this._cardData = this._getCardData(this._currentData.response.Items, this._currentData.response.resolved);
                break;

            case '/lms/update':
                this._onReload();
                //alert('Data saved successfully!');
                break;

            case '/lms/add':
                //OSLL: Fetch new data for current user.
                this.initialLoad();
                break;

            default:
                break;
        }
    }

    _onCountChange(val) {

    }

    _onAdd(e) {
        let _credentials = getData('credentials');
        this.$.ajax_id.headers['accessToken'] = _credentials.accessToken;
        switch (e.detail.type) {
            case 'course':
                this._addCourse(e.detail.name);
                break;

            default:
                //OSLL: All other elements are added in the same way ;-)
                //      To add content just 'update' a new element.
                let _data = {
                    id: this._currentId,
                    rid: getId(e.detail.type),
                    type: this._getStoreType(e.detail.type),
                    content: {}
                }
                this._saveData(_data);
                break;
        }
    }

    _onPublish(e) {

    }

    _onDelete(e) {

    }


    _onEdit(e) {
        this._fetchData({ id: e.detail.id });
    }

    _onSave(e) {
        this._saveData(this.$.form_id.getFormData());
    }

    _onBack(e) {
        this._fetchData({ id: this._getPreviousLocation() });
        this._updatePath('pop');
    }

    _onReload(e) {
        this._reload = true;
        this._fetchData({ id: this._currentId });
    }

    _dataFilter(item) {
        //OSLL: Use this filter function on <dom-repeat> just to count number of received items.        
        this._cardCount++;
        return true;
    }

    _getCardData(items, resolved) {
        let _r = [];
        let _template = {
            type: '',
            abstract: ''
        }
        switch (resolved) {
            case 'users':
                this.type = 'root';
                this._addData = Array.from(_addTypeMap[this.type]);
                if (items.length > 0) {
                    if (this._reload == false) {
                        this._updateLocation(items[0].userId);
                        this._currentId = items[0].userId;
                    }
                    this._reload = false;

                    for (let i of items) {
                        let _card = Object.assign({}, _template);
                        let _attributes = JSON.parse(i.attributes);
                        _card.type = 'course';
                        _card.title = `COURSE: ${_attributes.name}`;
                        _card.id = i.sourceId;
                        _r.push(_card);
                    }
                }
                break;

            default:
            case 'courses':
                let _addData_ = [];
                let _addDataCount = [];
                for (let i of items) {
                    if (i.sourceId == i.relatedId) {
                        //OSLL: Form data corresponds to this item that shoul not be shown on content list.
                        //      By updating this.type, form and new options will automatically update on view.                        
                        //OSLL: Pass data to form before switch the view.
                        this.$.form_id.setFormData(i);
                        this.type = this._getLocalType(i.type);
                        _addData_ = Array.from(_addTypeMap[this.type]);

                        //OSLL: Update navigation references  
                        if (this._reload == false) {
                            this._updatePath('push', this.type);
                            this._updateLocation(i.sourceId);
                            this._currentId = i.sourceId;
                        }
                        this._reload = false;

                    } else {
                        let _type = this._getLocalType(i.type);
                        if (_addDataCount[_type] == undefined) {
                            _addDataCount[_type] = { type: _type, count: 1 };
                        } else {
                            _addDataCount[_type].count++;
                        }

                        let _card = Object.assign({}, _template);
                        _card.type = this._getLocalType(i.type);
                        _card.title = i.type;
                        _card.id = i.relatedId;
                        _r.push(_card);
                    }
                }
                //OSLL: Iterate over '_addData_copy' and remove the 'add cards' according to its 'max' property.
                //OSLL: Here is need to use a copy because 'splice' will modify source array and alter the iteration range...
                let _addData_copy = Array.from(_addData_);
                for (let t of _addData_copy) {
                    if (t.max < 0) continue;
                    else if (_addDataCount[t.type] == undefined) continue;
                    else if (_addDataCount[t.type].count >= t.max) {
                        //OSLL: Max number of elements of this type is reached. Remove current entry.
                        let _idx = 0;
                        for (let x of _addData_) {
                            if (x.type == t.type) {
                                _addData_.splice(_idx, 1);
                                break;
                            }
                            _idx++;
                        }
                    }
                }
                //OSLL: Here is need to use a copy in order to trigger data change in binding single time.
                this._addData = _addData_;
                break;
        }
        return _r;
    }

    _getLocalType(dbType) {
        let _r = dbType.toLowerCase().substring(1, dbType.length);
        return _r;
    }

    _getStoreType(dbType) {
        let _r = 't' + dbType.toUpperCase();
        return _r;
    }


} //class

window.customElements.define('nav-view', NavView);