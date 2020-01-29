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
    }
});