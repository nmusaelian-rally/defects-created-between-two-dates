Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    _startDate:null,
    _endDate:null,
    launch: function() {
	var that = this;
	var minDate = new Date(new Date() - 86400000*360); //minDate cannot be further than one year
	var datePicker = Ext.create('Ext.panel.Panel', {
	    title: 'Choose start and end dates:',
	    bodyPadding: 10,
	    renderTo: Ext.getBody(),
	    layout: 'hbox',
	    items: [{
		xtype: 'rallydatepicker',
		itemId: 'from',
		minDate: minDate,
                showToday: false,
		handler: function(picker, date) {
		     that._onStartDateSelected(date);
		    }
		},
		{
		xtype: 'rallydatepicker',
		itemId: 'to',
		minDate: minDate,
                showToday: false,
		handler: function(picker, date) {
		     that._onEndDateSelected(date);
		}
	    }],
	});        
	this.add(datePicker);
	var panel =  Ext.create('Ext.panel.Panel', {
	    id:'infoPanel',
            padding: '30 10 30',
	    componentCls: 'panel'
	});
	this.add(panel);
    },
    _onStartDateSelected:function(date){
	console.log(date);
	this._startDate = Rally.util.DateTime.format(new Date(date), 'Y-m-d');
	if (this._endDate) {
	    Ext.getCmp('infoPanel').update('SHOWING DEFECTS CREATED BETWEEN: ' + this._startDate + ' and ' + this._endDate);
	    this._getData();
	}
	else{
	    Ext.getCmp('infoPanel').update('START DATE SELECTED: ' + this._startDate + '. PICK END DATE');
	}
    },
   
    _onEndDateSelected:function(date){
	console.log(date);
	this._endDate = Rally.util.DateTime.format(new Date(date), 'Y-m-d');
	Ext.getCmp('infoPanel').update('SHOWING DEFECTS CREATED BETWEEN: ' + this._startDate + ' and ' + this._endDate);
	this._getData();
    },   
	
    _getData: function(){
	var projectRef = this.getContext().getProject()._ref;
	this._filters = [
	    {
		property : 'CreationDate',
		operator : '>=',
		value : this._startDate
	    },
	    {
		property : 'CreationDate',
		operator : '<=',
		value : this._endDate
	    },
	    {
		property : 'Tags.Name',
		operator: 'contains',
		value: 'Customer Voice'
	    }
	];
	
	var storeConfig = {
	    model: 'Defect',
	    remoteSort: false,
	    fetch: ['Name','State','CreationDate','FormattedID', 'ObjectID', 'Project'],
	    filters: this._filters
	};
	this._updateGrid(storeConfig);
     },
    _updateGrid: function(storeConfig){
	if(this._grid === undefined){
	    this._createGrid(storeConfig);
	}
	else{
	    this._grid.store.clearFilter(true);
	    this._grid.store.filter(this._filters);
	}
   },
    _createGrid: function(storeConfig){
	var that = this;
	this._grid = Ext.create('Rally.ui.grid.Grid', {
	    storeConfig: storeConfig,
	    enableEditing: false,
	    showRowActionsColumn: false,
	    columnCfgs: [
		{text: 'FormattedID', dataIndex: 'FormattedID'},
		{text: 'Name', dataIndex: 'Name'},
		{text: 'CreationDate', dataIndex: 'CreationDate'},
		{text: 'State', dataIndex: 'State'},
		{text: 'Project', dataIndex: 'Project'}
	    ]
	});
	this.add(this._grid);
   }
});