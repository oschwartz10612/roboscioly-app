
  var team_table;
  var officer_table;
  var teacher_table;
  var emails_table;

  function closeApp() {
    $.get( "/admin/api/closeApp", function( data ) {
      if (data == 'done') {
        location.reload();
      }
    });
  }

  function openApp() {
    $.get( "/admin/api/openApp", function( data ) {
      if (data == 'done') {
        location.reload();
      }
    });
  }

  function closeMain() {
    $.get( "/admin/api/closeMain", function( data ) {
      if (data == 'done') {
        location.reload();
      }
    });
  }

  function openMain() {
    $.get( "/admin/api/openMain", function( data ) {
      if (data == 'done') {
        location.reload();
      }
    });
  }

  function closeOfficer() {
    $.get( "/admin/api/closeOfficer", function( data ) {
      if (data == 'done') {
        location.reload();
      }
    });
  }

  function openOfficer() {
    $.get( "/admin/api/openOfficer", function( data ) {
      if (data == 'done') {
        location.reload();
      }
    });
  }

    function closeCollectEmail() {
    $.get( "/admin/api/closeCollectEmail", function( data ) {
      if (data == 'done') {
        $('#sucsess').show();
           $(".alert").delay(4000).slideUp(200, function() {
              $(this).hide();
        });
      }
    });
  }

  function openCollectEmail() {
    $.get( "/admin/api/openCollectEmail", function( data ) {
      if (data == 'done') {
        $('#sucsess').show();
           $(".alert").delay(4000).slideUp(200, function() {
              $(this).hide();
        });
      }
    });
  }

  let textareas = ["textarea","textarea1","textarea2","textarea3","textarea4","textarea5","textarea6","textarea7","textarea_rec"];
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
            editor:"textarea"
          });
        } else {
          if(element == 'user_id') {
            columns.push({
              title: element,
              field: element
            }); 
          } else {
            columns.push({
              title: element,
              field: element,
              editor:"input"
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
    let dropdown = $('#filter-field');
    for (let i = 0; i < rawColumns.length; i++) {
      const element = rawColumns[i];
      dropdown.append($('<option></option>').val(element).html(element));
    }
    
    team_table = new Tabulator("#team-table", {
        ajaxURL:"/admin/api/alldata", 
        height:"800px",
        pagination:"local",
        layout:"fitDataFill",
        selectable:true,
        paginationSize:20,
        paginationSizeSelector:[20, 30, 40, 50],
        tooltips:true,
        columns: columns,
        cellEdited:function(cell){
         // This callback is called any time a cell is edited.

         $.ajax({
           url: "/admin/api/update_sql",
           data: cell.getRow().getData(),
           type: "post",
           success: function(response, textStatus, xhr){
            $('#sucsess').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
           },
           error: function(XMLHttpRequest, textStatus, error){
            $('#error').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
           }
         })

       },
      rowSelectionChanged:function(data, rows) {
        appDeleteData = data;
        appDeleteRows = rows;
      },
    });
    $("#selectAll").click(function() {
      team_table.selectRow();
    })

    $("#show-text").click(function(){
    let columns = [];
    let textareas = ["textarea","textarea1","textarea2","textarea3","textarea4","textarea5","textarea6","textarea7","textarea_rec"];
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
    var newTable = new Tabulator("#team-table-textarea", {
      ajaxURL:"/admin/api/alldata", 
      height:"1200px",
      pagination:"local",
      layout:"fitDataFill",
      paginationSize:20,
      paginationSizeSelector:[20, 30, 40, 50],
      columns: columns
    });
    $("#show-text").remove();
  });

  $("#download-csv").click(function(){
    team_table.download("csv", "data.csv");
  });

  //Update filters on value change
  $("#filter-field, #filter-type").change(updateFilter);
  $("#filter-value").keyup(updateFilter);

  //Clear filters on "Clear Filters" button click
  $("#filter-clear").click(function(){
      $("#filter-field").val("");
      $("#filter-type").val("=");
      $("#filter-value").val("");

      team_table.clearFilter();
  });
    //Trigger setFilter function with correct parameters
  function updateFilter() {

      var filter = $("#filter-field").val() == "function" ? customFilter : $("#filter-field").val();

      if($("#filter-field").val() == "function" ){
          $("#filter-type").prop("disabled", true);
          $("#filter-value").prop("disabled", true);
      }else{
          $("#filter-type").prop("disabled", false);
          $("#filter-value").prop("disabled", false);
      }

      team_table.setFilter(filter, $("#filter-type").val(), $("#filter-value").val());
      
  }
  }

  function deleteAppRows() {

    if (appDeleteData.length != 0) {

      var data = [];

      appDeleteData.forEach(row => {
        data.push(row.user_id)
      });

      $.ajax({
        url: "/admin/api/deleteTeam",
        data: {ids: data},
        type: "post",
        success: function(response, textStatus, xhr){
          $('#sucsess').show();
            $(".alert").delay(4000).slideUp(200, function() {
                $(this).hide();
          });
          appDeleteRows.forEach(row => {
            row.delete()
          })
          appDeleteData = [];
        },
        error: function(XMLHttpRequest, textStatus, error){
          $('#error').show();
            $(".alert").delay(4000).slideUp(200, function() {
                $(this).hide();
          });
        }
      })
    } else {
      alert('Please select some rows')
    }
  }

  var teacher_columns = [{title: "ID", field: "id"}, {title: "Email", field: "email", editor:"input"}, {title: "Name", field: "name", editor:"input"}, {title: "Department", field: "department", editor:"select", editorParams:{"science":"science", "math":"math"}}];
  var teacherDeleteRows;
  var teacherDeleteData;
  teacher_table = new Tabulator("#teacher-table", {
        ajaxURL:"/admin/api/teacher_data", 
        height:"800px",
        pagination:"local",
        layout:"fitDataFill",
        paginationSize:20,
        selectable:true,
        paginationSizeSelector:[20, 30, 40, 50],
        tooltips:true,
        columns: teacher_columns,
        cellEdited:function(cell){
         // This callback is called any time a cell is edited.
          
          $.ajax({
          url: "/admin/api/update_sql_teachers",
          data: cell.getRow().getData(),
          type: "post",
          success: function(response, textStatus, xhr){
            console.log(response);
            if (response.success == 'Added Successfully') {
              cell.getRow().update({'id': response.insertId})
            }
            
            $('#sucsess').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
          },
          error: function(XMLHttpRequest, textStatus, error){
            $('#error').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
          }
        })
         
       },
       rowSelectionChanged:function(data, rows) {
        teacherDeleteRows = rows;
        teacherDeleteData = data;
      }
    });
    $("#add-row").click(function(){
      teacher_table.addRow({id: "new"});
    });
    $("#selectAllTeachers").click(function() {
      teacher_table.selectRow();
    })

    function deleteTeacherRows() {

      if (teacherDeleteData.length != 0) {

        var data = [];

        teacherDeleteData.forEach(row => {
          data.push(row.id)
        });

        $.ajax({
           url: "/admin/api/deleteTeachers",
           data: {ids: data},
           type: "post",
           success: function(response, textStatus, xhr){
            $('#sucsess').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
            teacherDeleteRows.forEach(row => {
              row.delete()
            })
            teacherDeleteData = [];
           },
           error: function(XMLHttpRequest, textStatus, error){
            $('#error').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
           }
         })
      } else {
        alert('Please select some rows')
      } 
    }



  let officerTextareas = ["textarea","textarea1","textarea2","textarea3","textarea4"];
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
            editor:"textarea"
          });
        } else {
          if(element == 'user_id') {
            columns.push({
              title: element,
              field: element
            }); 
          } else {
            columns.push({
              title: element,
              field: element,
              editor:"input"
            }); 
          }
        }
      }
      buildOfficerTable(columns, rawColumns);
    }
  });


  function buildOfficerTable(columns, rawColumns) {

    officer_table = new Tabulator("#officer-table", {
        ajaxURL:"/admin/api/allofficerdata", 
        height:"800px",
        pagination:"local",
        layout:"fitDataFill",
        selectable:true,
        paginationSize:20,
        paginationSizeSelector:[20, 30, 40, 50],
        tooltips:true,
        columns: columns,
        cellEdited:function(cell){
         // This callback is called any time a cell is edited.

         $.ajax({
           url: "/admin/api/update_officer_sql",
           data: cell.getRow().getData(),
           type: "post",
           success: function(response, textStatus, xhr){
            $('#sucsess').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
           },
           error: function(XMLHttpRequest, textStatus, error){
            $('#error').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
           }
         })

       },
      rowSelectionChanged:function(data, rows) {
        officerDeleteData = data;
        officerDeleteRows = rows;
      },
    });
    $("#selectAllOfficers").click(function() {
      officer_table.selectRow();
    })
    $("#download-csv-officers").click(function(){
      officer_table.download("csv", "data.csv");
    });
  }

  function deleteOfficerRows() {

    if (officerDeleteData.length != 0) {

      var data = [];

      officerDeleteData.forEach(row => {
        data.push(row.user_id)
      });

      $.ajax({
        url: "/admin/api/deleteOfficers",
        data: {ids: data},
        type: "post",
        success: function(response, textStatus, xhr){
          $('#sucsess').show();
            $(".alert").delay(4000).slideUp(200, function() {
                $(this).hide();
          });
          officerDeleteRows.forEach(row => {
            row.delete()
          })
          officerDeleteData = [];
        },
        error: function(XMLHttpRequest, textStatus, error){
          $('#error').show();
            $(".alert").delay(4000).slideUp(200, function() {
                $(this).hide();
          });
        }
      })
    } else {
      alert('Please select some rows')
    } 
  }

  $('#instructionsForm').submit(function(e){
    e.preventDefault();
    $.ajax({
        url:'/admin/api/instructions',
        type:'post',
        data:$('#instructionsForm').serialize(),
        success:function(response){
          console.log(response);
          
           $('#sucsess').show();
           $('html,body').scrollTop(0);
           $(".alert").delay(4000).slideUp(200, function() {
              $(this).hide();
          });
        },
        error: function(XMLHttpRequest, textStatus, error){
          console.log(error);
            $('#error').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
           }
    });
});

var emails_columns = [{title: "ID", field: "id"}, {title: "Name", field: "name"}, {title: "Email", field: "email"}];
  var emailsDeleteRows;
  var emailsDeleteData;
  emails_table = new Tabulator("#emails-table", {
        ajaxURL:"/admin/api/emails_data", 
        height:"800px",
        pagination:"local",
        layout:"fitDataFill",
        paginationSize:20,
        selectable:true,
        paginationSizeSelector:[20, 30, 40, 50],
        tooltips:true,
        columns: emails_columns,
        rowSelectionChanged:function(data, rows) {
          emailsDeleteRows = rows;
          emailsDeleteData = data;
        }
    });
    $("#selectAllEmails").click(function() {
      emails_table.selectRow();
    })

    function deleteEmailsRows() {

      if (emailsDeleteData.length != 0) {

        var data = [];

       emailsDeleteData.forEach(row => {
          data.push(row.id)
        });

        $.ajax({
           url: "/admin/api/deleteEmails",
           data: {ids: data},
           type: "post",
           success: function(response, textStatus, xhr){
            $('#sucsess').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
            emailsDeleteRows.forEach(row => {
              row.delete()
            })
            emailsDeleteData = [];
           },
           error: function(XMLHttpRequest, textStatus, error){
            $('#error').show();
              $(".alert").delay(4000).slideUp(200, function() {
                  $(this).hide();
            });
           }
         })
      } else {
        alert('Please select some rows')
      } 
    }

function fixTable() {
  setTimeout(() => {
    officer_table.redraw(true);
    teacher_table.redraw(true);
    emails_table.redraw(true);
  }, 1)
}
