var $tblContextMenu;

exports.postToolbarInit = (hookName, context, cb) => {
  const editbar = context.toolbar; // toolbar is actually editbar - http://etherpad.org/doc/v1.5.7/#index_editbar
  editbar.registerCommand('insertTable', () => {
    openContextMenu();
  });

  return cb();
}

const openContextMenu = function (init) {
  if (!$tblContextMenu) initContextMenu();
  $tblContextMenu.css({ 'top': '45px', 'left': $('.buttonicon.ep_tables4.ep_insert_table').offset().left }).toggle();
};

const hideContextMenu = function () {
  $tblContextMenu.hide();
}

const initContextMenu = function () {


  $tblContextMenu = $('#table-context-menu').appendTo('#editbar', function () {

    $tblContextMenu.css({ 'top': '45px', 'left': $('.buttonicon.ep_tables4.ep_insert_table').offset().left, 'z-index': '1000000000000', 'display': 'block', 'visibility': 'visible' });

  });


  $("#create-table-container").hover(function () {
    $('#create-table-container').show();
  }, function () {
    $('#create-table-container').hide();
  });

  $('#tbl_prop_menu_hide').click(openContextMenu);
  $("#tbl_prop_create_table").hover(function () {
    $('#create-table-container').show();
  }, function () {
    $('#create-table-container').hide();
  });

  $tblContextMenu.find('.menu-item:not(#tbl_prop_create_table)').hover(function () {
    $('#create-table-container').hide();
  });

  // Selecting the size of the table to create
  var timerSelectedOnHover;
  $('#new-table-size-selector td').hover(function () {
    clearTimeout(timerSelectedOnHover);
    $('#new-table-size-selector td').removeClass('selected');
    for (var x = 0; x <= $(this).index(); x++) {
      for (var y = 0; y <= $(this).parent().index(); y++) {
        $(this).parent().parent().children().eq(y).children().eq(x).addClass('selected');
      }
    }
  }, function () {
    timerSelectedOnHover = setTimeout(function () { $('#new-table-size-selector td').removeClass('selected'); }, 200);
  });
  $('#new-table-size-selector td').hover(function () {
    xVal = this.getAttribute('value')
    yVal = $(this).closest("tr")[0].getAttribute("value");
    $("#new-table-size").html(xVal + " X " + yVal);
  });
  $("td", "#new-table-size-selector").click(function (e) {
    context.ace.callWithAce(function (ace) {
      ace.ace_doDatatableOptions('addTbl', 'addTblX' + $("#new-table-size").text());
    }, 'tblOptions', true);
    setTimeout(function () { hideContextMenu(); }, 500);
    return false;
  });

  // Handle menu action click
  $tblContextMenu.find('.menu-item[data-action]').click(function () {
    var action = $(this).attr('data-action');
    context.ace.callWithAce(function (ace) {
      ace.ace_doDatatableOptions(action);
    }, 'tblOptions', true);
    hideContextMenu();
    return false;
  });

  $('#tbl_prop_menu_hide').click(hideContextMenu);
  $('#editorcontainer').click(hideContextMenu);
}
