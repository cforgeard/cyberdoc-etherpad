exports.documentReady = function () {
  $.getScript('../static/plugins/ep_aa_file_menu_toolbar/static/js/lib/jquery-css-dropdown-plugin-master/dropdown-menu.js', () => {
    $(() => {
      $('.dropdown-menu').dropdown_menu({
        open_delay: 0, // Delay on menu open
        close_delay: 0, // Delay on menu close
      });
    });
  });

  $('#filemenutoolbarsettings').click(() => {
    $('#settings').addClass('popup-show');
  });

  $('#filemenutoolbarembed').click(() => {
    $('#embed').addClass('popup-show');
  });
};