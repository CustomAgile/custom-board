Ext.override(Rally.ui.cardboard.CardBoard, {
    _buildColumnsFromModel: function () {
        if (this.attribute === 'Project' && this.getModel()) {
            Rally.getApp()._getCurrentProjectHierarchyForBoardColumns().then({
                scope: this,
                success: function (retrievedColumns) {
                    this.fireEvent('columnsretrieved', this, retrievedColumns);
                    this.columnDefinitions = [];
                    this._toggleMask(true);
                    _.each(retrievedColumns, this.addColumn, this);
                    this.renderColumns();
                }
            });
        }
        else {
            this.callParent(arguments);
        }
    },

    _onAllColumnsReady: function () {
        this.callParent(arguments);

        // Hide Empty Project Columns
        if (this.attribute === 'Project') {
            let visibleColumns = 0;
            let rows = this.getRows();
            _.each(this.getColumns(), (column) => {
                if (column && !column.getRecords().length) {
                    // this.destroyColumn(column);
                    column.setVisible(false);
                    _.each(rows, (row) => {
                        row.hideColumn(column);
                    });
                }
                else {
                    visibleColumns++;
                }
            });
            let width = visibleColumns * (visibleColumns < 15 ? visibleColumns < 10 ? visibleColumns < 3 ? 400 : 350 : 300 : 250);
            this.getEl().setStyle('min-width', width + 'px');
            this.setWidth(width);
        }
    },

});

Ext.override(Rally.ui.dialog.SharedViewDialog, {
    /* 
        Dialog and Combobox weren't refreshing after adding a new shared
        view, so here we are 
    */
    _onCreate: function (dialog, record) {
        if (this.grid) {
            this.grid.getStore().reload();
        }
        let newPrefRef = record.get('_ref');
        let combobox = Rally.getApp().down('#sharedViewCombo');

        if (newPrefRef && combobox) {
            combobox.getStore().reload();
            combobox.setValue(newPrefRef);
            combobox.saveState();
        }

        this.down('#doneButton').focus();
    },
});

Ext.override(Rally.ui.gridboard.GridBoard, {
    getCurrentView: function () {
        let views = [];
        let ancestorPlugin = Rally.getApp().ancestorFilterPlugin;

        if (ancestorPlugin) {
            views = Ext.apply(this.callParent(arguments), ancestorPlugin.getCurrentView());
        }
        else {
            views = this.callParent(arguments);
        }

        return views;
    },
    setCurrentView: function (view) {
        var app = Rally.getApp();
        app.down('#grid-area').setLoading('Loading View...');
        // Ext.suspendLayouts();        

        if (app.ancestorFilterPlugin) {
            if (view.filterStates) {
                app.ancestorFilterPlugin.mergeLegacyFilter(view.filterStates, view, app.modelNames[0]);
            }
            app.ancestorFilterPlugin.setCurrentView(view);
        }

        this.callParent(arguments);

        setTimeout(async function () {
            // Ext.resumeLayouts(true);            
            app._addBoard();
        }.bind(this), 1200);
    }
});