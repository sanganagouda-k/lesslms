/**
`<paper-tree-node>` display a tree node with expandable/collapsible capabilities and actions menu.

A node is defined by a name, an icon and a list of actions.

Example:

    <paper-tree-node></paper-tree-node>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--paper-tree-selected-background-color`      | Highlight color for selected node           | `rgba(200, 200, 200, 0.5)`
`--paper-tree-selected-color`                 | Text and icon color for selected node       | `inherit`
`--paper-tree-toggle-theme`                   | Change theme for node +/- toggle            |
`--paper-tree-icon-theme`                     | Change theme for node icon                  |

@demo
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { Polymer } from '../../node_modules/@polymer/polymer/polymer-legacy.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-menu-button/paper-menu-button.js';
import '../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../node_modules/@polymer/paper-item/paper-item.js';
import '../../node_modules/@polymer/iron-icons/iron-icons.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="paper-tree-node">
<template>
    <style>
        :host {
            font-size: 100%;
            /*--iron-icon-stroke-color: var(--paper-blue-700) !important;*/
            --iron-icon-fill-color: var(--paper-blue-700) !important;
        }

        :host(.selected) &gt; .node-container &gt; .node-row {
            /*background-color: var(--paper-tree-selected-background-color, rgba(200, 200, 200, 0.5));*/
            color: var(--paper-tree-selected-color, inherit);
        }

        :host(.selected) &gt; .node-container &gt; .node-row &gt; #actions {
            display: inline-block;
        }

        .node-container {
            white-space: nowrap;
        }

        .node-row {
            padding-left: 4px;
            padding-right: 4px;
        }

        .node-preicon.collapsed,
        .node-preicon.expanded {
            padding-left: 0px;
        }

        .node-preicon {
            padding-left: 18px;
        }

        .node-preicon:before {
            margin-right: 5px;
            @apply(--paper-tree-toggle-theme);
        }

        .node-preicon.collapsed:before {
            content: '\\002B';
        }

        .node-preicon.expanded:before {
            content: '\\2212';
        }

        .node-preicon, .node-name {
            cursor: pointer;
        }

        .node-icon {
            cursor: pointer;
            width: 24px;
            height: 24px;
            @apply(--paper-tree-icon-theme);
        }

        #actions {
            display: none;
            float: right;
            padding: 0;
            top: -8px; /* cancel the padding of \`paper-icon-button\`. */
        }

        ul {
            margin: 0;
            padding-left: 10px;
        }

        li {
            list-style-type: none;
        }

        [hidden] {
            display: none;
        }
    </style>    
        <div class="node-container">
            <div class="node-row">
                <span class\$="{{_computeClass(data.*)}}" on-click="toggleChildren"></span>
                <iron-icon class="node-icon" icon\$="{{_computeIcon(data.icon)}}" on-click="select"></iron-icon>
                <span class="node-name" on-click="select">{{data.name}}</span>

                <template is="dom-if" if="{{actions}}">
                    <paper-menu-button>
                        <paper-icon-button icon="menu" slot="dropdown-trigger"></paper-icon-button>
                        <paper-listbox slot="dropdown-content">
                            <template is="dom-repeat" items="{{actions}}">
                                <paper-item on-click="_actionClicked">{{item.label}}</paper-item>
                            </template>
                        </paper-listbox>
                        </paper-menu-button> 
                </template>
                
            </div>
            <template is="dom-if" if="{{data.open}}">
              <ul>
                  <template is="dom-repeat" items="{{data.children}}">
                      <li>
                          <paper-tree-node data="{{item}}" actions="{{actions}}"></paper-tree-node>
                      </li>
                  </template>
              </ul>
            </template>
        </div>
    </template>

</dom-module>`;

document.head.appendChild($_documentContainer.content);

Polymer({

    is: 'paper-tree-node',

    properties: {

        /**
         * Data hold by this node (contains the children).
         *
         * Specific data:
         *
         * - `data.name`: string representing the node name.
         * - `data.icon`: string telling which icon to use (default to 'folder' icon).
         * - `data.open`: boolean telling whether the node is expanded or not.
         * - `data.children` array containing the children of the node.
         */
        data: {
            type: Object,
            value: function() {
                return null;
            }
        },

        /**
         * `actions` available for this node. Each action object has the following fields:
         *
         * - `action.label`: string representing the display name of the menu item.
         * - `action.event`: string which is the event name to dispatch whenever the item is clicked.
         *
         */
        actions: {
            type: Array,
            value: function() {
                return null;
            }
        }

    },

    /**
     * The `select` event is fired whenever `select()` is called on the node.
     *
     * @event select
     */

    /**
     * The `toggle` event is fired whenever a tree node is expanded or collapsed.
     *
     * @event toggle
     */

    /**
     * Returns the necessary classes.
     *
     * @param {object} change An object containing the property that changed and its value.
     * @return {string} The class name indicating whether the node is open or closed
     */
    _computeClass: function(change) {
        var open = change && change.base && change.base.open;
        var children = change && change.base && change.base.children;
        return 'node-preicon ' + ((open && children && children.length) ? 'expanded' : children && children.length ? 'collapsed' : '');
    },

    /**
     * Compute the necessary node icon.
     *
     * @param {string=folder} an icon name.
     * @return {string} the computed icon name.
     */
    _computeIcon: function(icon) {
        return icon ? icon : 'folder';
    },

    _actionClicked: function(event) {
        this.fire(event.model.item.event, this);
    },

    /**
     * Highlights node as the selected node.
     */
    select: function(e) {
        //this.fire("select", this);
        this.dispatchEvent(new CustomEvent('select', { detail: { id: this.data.id }, bubbles: true, composed: true }));
    },

    /**
     * Returns the parent tree node. Returns `null` if root.
     */
    getParent: function() {
        return this.domHost.tagName === 'PAPER-TREE-NODE' ? this.domHost : null;
    },

    /**
     * Returns the children tree nodes.
     */
    getChildren: function() {
        return Polymer.dom(this.root).querySelectorAll('paper-tree-node');
    },

    /**
     * Display/Hide the children nodes.
     */
    toggleChildren: function() {
        this.set("data.open", !this.data.open && this.data.children && this.data.children.length);
        setTimeout(this.fire.bind(this, "toggle", this));
    }

});