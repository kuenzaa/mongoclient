/**
 * Created by RSercan on 29.12.2015.
 */
Template.browseCollection.onRendered(function () {
    if (!Session.get(Template.strSessionSelectedCollection)) {
        Router.go('browseDB');
        return;
    }

    var cmb = $('#cmbQueries');
    $.each(QUERY_TYPES, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    cmb.on('change', function () {
        Session.set(Template.strSessionSelectedOptions, []);
        $('#divJsonEditor').hide();
        $('#divAceEditor').hide();
    });

    Session.set(Template.strSessionSelectedOptions, []);
});

Template.browseCollection.events({
    'change #cmbQueries': function () {
        var value = $('#cmbQueries').find(":selected").text();
        if (value) {
            Session.set(Template.strSessionSelectedQuery, value);
        }
    },

    'click #btnSwitchView': function () {
        var jsonView = $('#divJsonEditor');
        var aceView = $('#divAceEditor');

        if (jsonView.css('display') == 'none') {
            aceView.hide();
            jsonView.show('slow');
        } else {
            jsonView.hide();
            aceView.show('slow');
        }
    },
    'click #btnExecuteQuery': function () {
        var queryTemplate = Session.get(Template.strSessionSelectedQuery);
        if (queryTemplate) {
            Template[queryTemplate].executeQuery();
        } else {
            Template["find"].executeQuery();
        }
    }
});

Template.browseCollection.helpers({
    'getQueryTemplate': function () {
        if (!Session.get(Template.strSessionSelectedQuery)) {
            Session.set(Template.strSessionSelectedQuery, 'find')
        }

        return Session.get(Template.strSessionSelectedQuery);
    },

    'getHelpBlockForSelectedQuery': function () {
        switch (Session.get(Template.strSessionSelectedQuery)) {
            case QUERY_TYPES.FINDONE_AND_REPLACE:
                return Spacebars.SafeString('This query replaces whole document which matched by <strong>selector</strong> with the <strong>set</strong> object');

            case QUERY_TYPES.FINDONE_AND_DELETE:
                return Spacebars.SafeString('<strong><font color=\'red\'>CAUTION:</font></strong> This query removes whole document which matched by <strong>selector</strong>');
            default:
                return '';
        }
    }
});

Template.browseCollection.initExecuteQuery = function () {
    // hide results
    $('#divJsonEditor').hide();
    $('#divAceEditor').hide();

    // loading button
    var l = $('#btnExecuteQuery').ladda();
    l.ladda('start');
};

Template.browseCollection.setResult = function (result) {
    // set json editor
    Template.browseCollection.getEditor().set(result);

    // set ace editor
    AceEditor.instance("aceeditor", {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: "12pt",
            showPrintMargin: false
        });
        editor.setValue(JSON.stringify(result, null, '\t'), -1);
    });

    $('#divJsonEditor').show('slow');
};

var jsonEditor;
Template.browseCollection.getEditor = function () {
    if ($('.jsoneditor').length == 0) {
        jsonEditor = new JSONEditor(document.getElementById("jsoneditor"), {
            mode: "tree",
            search: true
        });
    }
    return jsonEditor;
};