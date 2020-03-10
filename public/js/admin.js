/*global Tabulator, customFilter */
/*eslint no-undef: "error"*/

var team_table;
var officer_table;
var teacher_table;
var emails_table;

$.ajax({
  url: "/admin/api/getcolumns",
  cache: false,
  success: function(result) {
    let rawColumns = [];
    let columns = [];
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      rawColumns.push(element.column_name);
    }
    for (let i = 0; i < rawColumns.length; i++) {
      const element = rawColumns[i];
      if (element.includes("textarea")) {
        columns.push({
          title: element,
          field: element,
          width: 200,
          editor: "textarea"
        });
      } else {
        if (element == "user_id") {
          columns.push({
            title: element,
            field: element
          });
        } else {
          columns.push({
            title: element,
            field: element,
            editor: "input"
          });
        }
      }
    }
    buildTable(columns, rawColumns);
  }
});

var appDeleteData;
var appDeleteRows;
function buildTable(columns, rawColumns) {
  let dropdown = $("#filter-field");
  for (let i = 0; i < rawColumns.length; i++) {
    const element = rawColumns[i];
    dropdown.append(
      $("<option></option>")
        .val(element)
        .html(element)
    );
  }

  team_table = new Tabulator("#team-table", {
    ajaxURL: "/admin/api/alldata",
    height: "800px",
    pagination: "local",
    layout: "fitDataFill",
    selectable: true,
    paginationSize: 20,
    paginationSizeSelector: [20, 30, 40, 50],
    tooltips: true,
    columns: columns,
    cellEdited: function(cell) {
      // This callback is called any time a cell is edited.

      $.ajax({
        url: "/admin/api/update_sql",
        data: cell.getRow().getData(),
        type: "post",
        success: function() {
          $("#sucsess").show();
          $(".alert")
            .delay(4000)
            .slideUp(200, function() {
              $(this).hide();
            });
        },
        error: function() {
          $("#error").show();
          $(".alert")
            .delay(4000)
            .slideUp(200, function() {
              $(this).hide();
            });
        }
      });
    },
    rowSelectionChanged: function(data, rows) {
      appDeleteData = data;
      appDeleteRows = rows;
    }
  });
  $("#selectAll").click(function() {
    team_table.selectRow();
  });

  $("#show-text").click(function() {
    let columns = [];
    for (let i = 0; i < rawColumns.length; i++) {
      const element = rawColumns[i];
      if (element.includes("textarea")) {
        columns.push({
          title: element,
          field: element,
          width: 500,
          formatter: "textarea"
        });
      } else {
        columns.push({
          title: element,
          field: element
        });
      }
    }
    $("#team-table").remove();
    new Tabulator("#team-table-textarea", {
      ajaxURL: "/admin/api/alldata",
      height: "1200px",
      pagination: "local",
      layout: "fitDataFill",
      paginationSize: 20,
      paginationSizeSelector: [20, 30, 40, 50],
      columns: columns
    });
    $("#show-text").remove();
  });

  $("#download-csv").click(function() {
    team_table.download("csv", "data.csv");
  });

  //Update filters on value change
  $("#filter-field, #filter-type").change(updateFilter);
  $("#filter-value").keyup(updateFilter);

  //Clear filters on "Clear Filters" button click
  $("#filter-clear").click(function() {
    $("#filter-field").val("");
    $("#filter-type").val("=");
    $("#filter-value").val("");

    team_table.clearFilter();
  });
  //Trigger setFilter function with correct parameters
  function updateFilter() {
    var filter =
      $("#filter-field").val() == "function"
        ? customFilter
        : $("#filter-field").val();

    if ($("#filter-field").val() == "function") {
      $("#filter-type").prop("disabled", true);
      $("#filter-value").prop("disabled", true);
    } else {
      $("#filter-type").prop("disabled", false);
      $("#filter-value").prop("disabled", false);
    }

    team_table.setFilter(
      filter,
      $("#filter-type").val(),
      $("#filter-value").val()
    );
  }
}

var teacher_columns = [
  { title: "ID", field: "id" },
  { title: "Email", field: "email", editor: "input" },
  { title: "Name", field: "name", editor: "input" },
  {
    title: "Department",
    field: "department",
    editor: "select",
    editorParams: { science: "science", math: "math" }
  }
];
var teacherDeleteRows;
var teacherDeleteData;
teacher_table = new Tabulator("#teacher-table", {
  ajaxURL: "/admin/api/teacher_data",
  height: "800px",
  pagination: "local",
  layout: "fitDataFill",
  paginationSize: 20,
  selectable: true,
  paginationSizeSelector: [20, 30, 40, 50],
  tooltips: true,
  columns: teacher_columns,
  cellEdited: function(cell) {
    // This callback is called any time a cell is edited.

    $.ajax({
      url: "/admin/api/update_sql_teachers",
      data: cell.getRow().getData(),
      type: "post",
      success: function(response) {
        console.log(response);
        if (response.success == "Added Successfully") {
          cell.getRow().update({ id: response.insertId });
        }

        $("#sucsess").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
      },
      error: function() {
        $("#error").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
      }
    });
  },
  rowSelectionChanged: function(data, rows) {
    teacherDeleteRows = rows;
    teacherDeleteData = data;
  }
});
$("#add-row").click(function() {
  teacher_table.addRow({ id: "new" });
});
$("#selectAllTeachers").click(function() {
  teacher_table.selectRow();
});

var officerDeleteData;
var officerDeleteRows;
$.ajax({
  url: "/admin/api/getofficercolumns",
  cache: false,
  success: function(result) {
    let rawColumns = [];
    let columns = [];
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      rawColumns.push(element.column_name);
    }
    for (let i = 0; i < rawColumns.length; i++) {
      const element = rawColumns[i];
      if (element.includes("textarea")) {
        columns.push({
          title: element,
          field: element,
          width: 200,
          editor: "textarea"
        });
      } else {
        if (element == "user_id") {
          columns.push({
            title: element,
            field: element
          });
        } else {
          columns.push({
            title: element,
            field: element,
            editor: "input"
          });
        }
      }
    }
    buildOfficerTable(columns, rawColumns);
  }
});

function buildOfficerTable(columns) {
  officer_table = new Tabulator("#officer-table", {
    ajaxURL: "/admin/api/allofficerdata",
    height: "800px",
    pagination: "local",
    layout: "fitDataFill",
    selectable: true,
    paginationSize: 20,
    paginationSizeSelector: [20, 30, 40, 50],
    tooltips: true,
    columns: columns,
    cellEdited: function(cell) {
      // This callback is called any time a cell is edited.

      $.ajax({
        url: "/admin/api/update_officer_sql",
        data: cell.getRow().getData(),
        type: "post",
        success: function() {
          $("#sucsess").show();
          $(".alert")
            .delay(4000)
            .slideUp(200, function() {
              $(this).hide();
            });
        },
        error: function() {
          $("#error").show();
          $(".alert")
            .delay(4000)
            .slideUp(200, function() {
              $(this).hide();
            });
        }
      });
    },
    rowSelectionChanged: function(data, rows) {
      officerDeleteData = data;
      officerDeleteRows = rows;
    }
  });
  $("#selectAllOfficers").click(function() {
    officer_table.selectRow();
  });
  $("#download-csv-officers").click(function() {
    officer_table.download("csv", "data.csv");
  });
}

$("#instructionsForm").submit(function(e) {
  e.preventDefault();
  $.ajax({
    url: "/admin/api/instructions",
    type: "post",
    data: $("#instructionsForm").serialize(),
    success: function() {
      $("#sucsess").show();
      $("html,body").scrollTop(0);
      $(".alert")
        .delay(4000)
        .slideUp(200, function() {
          $(this).hide();
        });
    },
    error: function() {
      $("#error").show();
      $(".alert")
        .delay(4000)
        .slideUp(200, function() {
          $(this).hide();
        });
    }
  });
});

var emails_columns = [
  { title: "ID", field: "id" },
  { title: "Name", field: "name" },
  { title: "Email", field: "email" }
];
var emailsDeleteRows;
var emailsDeleteData;
emails_table = new Tabulator("#emails-table", {
  ajaxURL: "/admin/api/emails_data",
  height: "800px",
  pagination: "local",
  layout: "fitDataFill",
  paginationSize: 20,
  selectable: true,
  paginationSizeSelector: [20, 30, 40, 50],
  tooltips: true,
  columns: emails_columns,
  rowSelectionChanged: function(data, rows) {
    emailsDeleteRows = rows;
    emailsDeleteData = data;
  }
});
$("#selectAllEmails").click(function() {
  emails_table.selectRow();
});

$("#officer-tab").click(() => {
  fixTable()
})
$("#teachers-tab").click(() => {
  fixTable()
})
$("#emails-tab").click(() => {
  fixTable()
})

function fixTable() {
  setTimeout(() => {
    officer_table.redraw(true);
    teacher_table.redraw(true);
    emails_table.redraw(true);
  }, 1);
}

/* eslint-disable no-unused-vars */


$("#closeApp").click(() => {
  $.get("/admin/api/closeApp", function(data) {
    if (data == "done") {
      location.reload();
    }
  });
})
$("#openApp").click(() => {
  $.get("/admin/api/openApp", function(data) {
    if (data == "done") {
      location.reload();
    }
  });
})
$("#closeMain").click(() => {
  $.get("/admin/api/closeMain", function(data) {
    if (data == "done") {
      location.reload();
    }
  });
})
$("#openMain").click(() => {
  $.get("/admin/api/openMain", function(data) {
    if (data == "done") {
      location.reload();
    }
  });
})
$("#closeOfficer").click(() => {
  $.get("/admin/api/closeOfficer", function(data) {
    if (data == "done") {
      location.reload();
    }
  });
})
$("#openOfficer").click(() => {
  $.get("/admin/api/openOfficer", function(data) {
    if (data == "done") {
      location.reload();
    }
  });
})
$("#closeCollectEmail").click(() => {
  $.get("/admin/api/closeCollectEmail", function(data) {
    if (data == "done") {
      $("#sucsess").show();
      $(".alert")
        .delay(4000)
        .slideUp(200, function() {
          $(this).hide();
        });
    }
  });
})
$("#openCollectEmail").click(() => {
  $.get("/admin/api/openCollectEmail", function(data) {
    if (data == "done") {
      $("#sucsess").show();
      $(".alert")
        .delay(4000)
        .slideUp(200, function() {
          $(this).hide();
        });
    }
  });
})

$("#deleteAppRows").click(() => {
  if (appDeleteData.length != 0) {
    var data = [];

    appDeleteData.forEach(row => {
      data.push(row.user_id);
    });

    $.ajax({
      url: "/admin/api/deleteTeam",
      data: { ids: data },
      type: "post",
      success: function() {
        $("#sucsess").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
        appDeleteRows.forEach(row => {
          row.delete();
        });
        appDeleteData = [];
      },
      error: function() {
        $("#error").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
      }
    });
  } else {
    alert("Please select some rows");
  }
})

$("#deleteTeacherRows").click(() => {
  if (teacherDeleteData.length != 0) {
    var data = [];

    teacherDeleteData.forEach(row => {
      data.push(row.id);
    });

    $.ajax({
      url: "/admin/api/deleteTeachers",
      data: { ids: data },
      type: "post",
      success: function() {
        $("#sucsess").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
        teacherDeleteRows.forEach(row => {
          row.delete();
        });
        teacherDeleteData = [];
      },
      error: function() {
        $("#error").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
      }
    });
  } else {
    alert("Please select some rows");
  }
})
$("#deleteOfficerRows").click(() => {
  if (officerDeleteData.length != 0) {
    var data = [];

    officerDeleteData.forEach(row => {
      data.push(row.user_id);
    });

    $.ajax({
      url: "/admin/api/deleteOfficers",
      data: { ids: data },
      type: "post",
      success: function() {
        $("#sucsess").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
        officerDeleteRows.forEach(row => {
          row.delete();
        });
        officerDeleteData = [];
      },
      error: function() {
        $("#error").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
      }
    });
  } else {
    alert("Please select some rows");
  }
})

$("#deleteEmailsRows").click(() => {
  if (emailsDeleteData.length != 0) {
    var data = [];

    emailsDeleteData.forEach(row => {
      data.push(row.id);
    });

    $.ajax({
      url: "/admin/api/deleteEmails",
      data: { ids: data },
      type: "post",
      success: function() {
        $("#sucsess").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
        emailsDeleteRows.forEach(row => {
          row.delete();
        });
        emailsDeleteData = [];
      },
      error: function() {
        $("#error").show();
        $(".alert")
          .delay(4000)
          .slideUp(200, function() {
            $(this).hide();
          });
      }
    });
  } else {
    alert("Please select some rows");
  }
})
