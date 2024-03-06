document.getElementById("stepTrack").classList.add('active')

fetch('/getsteps')
  .then(response => response.json())
  .then(data => {
    var filterList = {year: null, class: null, subject:null, calenderYear:null}
    console.log(data);

    function appendListItems(parentElementId, itemsList) {
    const parentElement = document.getElementById(parentElementId);
    if (!parentElement) {
        console.error(`Parent element with id '${parentElementId}' not found`);
        return;
    }
    
    itemsList.forEach(item => {
        const listItem = document.createElement('option');
        listItem.value = item;
        listItem.textContent = item;
        parentElement.appendChild(listItem);
    });
    
    parentElement.addEventListener("change", function() {
      var selectedOption = parentElement.options[parentElement.selectedIndex];
      if (selectedOption.value == parentElementId){
        var selectedValue = null;
        filterListener(selectedValue, parentElementId)
      }
      else{
        var selectedValue = selectedOption.value;
        filterListener(selectedValue, parentElementId)
      }
    });
    }

    function filterListener(selectedValue, parentElementId) {
      const field = parentElementId.toLowerCase()
      console.log(`${field} == ${selectedValue}`);
      filterList[field] = selectedValue
      console.log(filterList)
    }

    let yearsList = [...new Set(data.map(item => item.year))];
    yearsList.sort();

    let classList = [...new Set(data.map(item => item.class))];
    classList.sort();

    let subjectList = [...new Set(data.map(item => item.subject))];
    subjectList.sort();

    let calenderlist = [...new Set(data.map(item => item.calenderYear))];
    calenderlist.sort();

    appendListItems('Year', yearsList);
    appendListItems('Class', classList);
    appendListItems('Subject', subjectList);
    appendListItems('Calender Year', calenderlist);

    console.log('List:years:',yearsList);
    console.log('List:class:',classList);
    console.log('List:subject:',subjectList);
    console.log('List:calender:',calenderlist);

    const terms = [...new Set(data.map(item => item.term))];
    const studentMap = data.reduce((map, item) => {
        map[item.studentID] = item.studentName;
        return map;
        }, {});
        const gradesMap = data.reduce((map, item) => {
            // Only add to the gradesMap if the necessary data is present
            if (item.subject && item.term && item.studentID) {
                const key = `${item.subject}_${item.term}`;
                if (!map[key]) {
                    map[key] = {};
                }
                map[key][item.studentID] = item.overallGrade;
            }
            return map;
        }, {});
        
        console.log('grades:', gradesMap);
        
    
    console.log('student:',studentMap);
    console.log('terms:',terms);
    console.log('step:',gradesMap);

    // Click event listener for the apply button
    document.getElementById("apply").addEventListener("click", function() {
        var filtered = Object.assign({}, data);
        // Filter the data based on the selected values
        filtered = data.filter(item =>
            (filterList.year !== null ? item.year === filterList.year : true) &&
            (filterList.class !== null ? item.class === filterList.class : true) &&
            (filterList.subject !== null ? item.subject === filterList.subject : true) &&
            (filterList.calenderYear !== null ? item.calenderYear === filterList.calenderYear : true)
        );
        // Log the filtered data and the filterList
        console.log(filtered);
        console.log(filterList);

        // Show the title of the table after filter the data
        var stepTrackTableTitle = document.getElementById("stepTrackTableTitle");
        stepTrackTableTitle.innerHTML = "<span class='title'>Filtered Step Track Data</span><br>";
     
        var table = document.getElementById("stepTrackTable");
        table.innerHTML = "";

        // Create the table header
        var thead = table.createTHead();
        var headerRow = thead.insertRow();
        var headers = ["Student Name", "Year", "Class","Term", "Overall Grade"];
        headers.forEach(headerText => {
            var th = document.createElement("th");
            var text = document.createTextNode(headerText);
            th.appendChild(text);
            headerRow.appendChild(th);
        });

        // Create the table body
        var tbody = table.createTBody();
        filtered.forEach(item => {
            var row = tbody.insertRow();
            headers.forEach(header => {
                var cell = row.insertCell();
                // Map the header to the corresponding item key
                var text = "";
                switch (header) {
                    case "Student Name":
                    text = item.studentName;
                    break;
                    case "Year":
                    text = item.year;
                    break;
                    case "Class":
                    text = item.class;
                    break;
                    case "Term":
                    text = item.term;
                    break;
                    case "Overall Grade":
                    text = item.overallGrade;
                    break;
                }
                cell.appendChild(document.createTextNode(text));
            });
        });

        // Create the step table
        createTable(filtered, studentMap, terms);
        // Calculate and update the overall steps
        calculateAndUpdateOverallSteps();


        // Create the evidence table
        var table2 = document.getElementById("evidenceTable");
        table2.innerHTML = "";
        const evidenceCounts = {};
        var totalEvidenceCounts = {};

        populateStudentDropdown(studentMap);
        populatetermDropdown(terms);

        filtered.forEach(item => {
            // Ensure there is an entry for the student
            if (!evidenceCounts[item.studentID]) {
              evidenceCounts[item.studentID] = {};
            }
        
            // Ensure there is an entry for the term for the student
            if (!evidenceCounts[item.studentID][item.term]) {
              evidenceCounts[item.studentID][item.term] = 0;
            }
        
            // Add the count of evidence entries
            evidenceCounts[item.studentID][item.term] += item.evidence.length;
          });
          
        

        // Create the table header for the evidence table
        var thead2 = table2.createTHead();
        var headerRow2 = thead2.insertRow();
        headerRow2.insertCell().textContent = 'Evidence';
        headerRow2.insertCell().textContent = 'Term';
        Object.values(studentMap).forEach(studentName => {
            const th2 = document.createElement("th");
            th2.textContent = studentName;
            headerRow2.appendChild(th2);
        });

        // Create the table body for the evidence table
        var tbody2 = table2.createTBody();
        // Assuming subStep descriptions are consistent across all data
        terms.forEach(term => {
            var row = tbody2.insertRow();
            row.insertCell().textContent = 'Evidence';
            var cell = row.insertCell();
            cell.textContent = term;

          
            // For each student, add a cell with the count of evidence
            Object.keys(studentMap).forEach(studentID => {

            if (!totalEvidenceCounts[studentID]) {
                totalEvidenceCounts[studentID] = 0; // Initialize the total count for this student
                }
              var countCell = row.insertCell();
              var count = evidenceCounts[studentID] && evidenceCounts[studentID][term] ? evidenceCounts[studentID][term] : 0;
              totalEvidenceCounts[studentID] += count; 
              countCell.textContent = count;
            });
        });
        var totalsRow = tbody2.insertRow();
        var totalsCell = totalsRow.insertCell();
        totalsCell.textContent = 'Total Evidence';
        totalsCell.colSpan = 2;
        console.log('Total Evidence:', totalEvidenceCounts);
        Object.keys(studentMap).forEach(studentID => {
            var totalCell = totalsRow.insertCell();
            totalCell.textContent = totalEvidenceCounts[studentID];
            });

        totalsRow.style.fontWeight = 'bold';
        totalsRow.style.backgroundColor = '#ffe4e4';


        const uniqueStudentIDs = [...new Set(filtered.map(item => item._id))];
        console.log('Unique Student IDs:', uniqueStudentIDs);
      
        const cardList = document.getElementById('studentCardList');
        cardList.innerHTML ='<thead><th><h3>Date</h3></th><th><h3>Student Name</h3></th><th><h3>Term</h3></th><th><h3>Evidence Type</h3></th><th><h3>Comments</h3></th><th><h3>File</h3></th><th><h3>Update Info</h3></th><th><h3>Delete Data</h3></th></thead>';
        uniqueStudentIDs.forEach(_id => {

            
            // Find the corresponding student object
            const student = filtered.find(item => item._id === _id);

            student.evidence.forEach(ev => {

            var objectId = student._id
            var date = ev.date
            var studentName = student.studentName
            var term = student.term
            var evidencetype = ev.type
            var comment = ev.comment
            var evidenceFile = ev.file
            

            console.log(objectId, date, studentName,term, evidencetype, comment, evidenceFile);

            addClient(objectId, date, studentName,term, evidencetype, comment, evidenceFile);

        });
    });

        document.getElementById('SignupBtn').addEventListener('click', () => {
            
            const studentName =  document.getElementById('studentNameSelect').options[document.getElementById('studentNameSelect').selectedIndex].text;
            const term = document.getElementById('termSelect').options[document.getElementById('termSelect').selectedIndex].text;
            const evidenceFileInput = document.getElementById('evidenceFile');
            const file = evidenceFileInput.files[0];
            console.log('Student Name:', studentName);
            console.log('Term:', term);
        
            // Find the corresponding student object with matching studentID and term
            const studentObject = filtered.find(item => item.studentName === studentName && item.term === term);
            const objectId = studentObject?._id // Assuming the _id is stored as an object with $oid key
            const subject = studentObject?.subject;

        
            if (!studentObject || !objectId) {
                alert('No matching student or term found!');
                return; // Exit the function if no match is found
            }
            else{   console.log('Student Object:', studentObject);
                    console.log('Object ID:', objectId);
            }
            const formData = new FormData();

            formData.append('_id', objectId); 
            formData.append('evidenceType', document.getElementById('evidencetype').value);
            formData.append('evidenceFile', file);
            formData.append('comment', document.getElementById('comment').value);
            formData.append('date', document.getElementById('evidencedate').value);
            formData.append('subject', subject);

            console.log('evidenceFile:', file);

            fetch('/updateEvidence', {
                method: 'PATCH',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    console.log('Evidence updated successfully');
                    // Refresh the page or table here if needed
                } else {
                    console.error('Failed to update evidence', data.message);
                }
            })
            .catch((error) => {
                console.error('Error updating evidence:', error);
            });
        });


        // Attach the update table function to the apply button
        document.getElementById("apply").addEventListener("click", updateTableWithFilters);

        // Attach update table function to each filter dropdown change event
        ['Year', 'Class', 'Subject', 'Calender Year'].forEach(filterName => {
        document.getElementById(filterName).addEventListener('change', updateTableWithFilters);
            });

            // Initial rendering of the table
            updateTableWithFilters();
        });

        function cycleGrade(cell) {
            const grades = [
                { grade: 'N', value: 0.005, colorClass: 'grade-N' },
                { grade: 'E', value: 0.05, colorClass: 'grade-E' },
                { grade: 'D', value: 0.5, colorClass: 'grade-D' },
                { grade: 'S', value: 1, colorClass: 'grade-S' },
            ];
            
            const currentGrade = cell.textContent.trim();
            let currentGradeIndex = grades.findIndex(g => g.grade === currentGrade);
            currentGradeIndex = (currentGradeIndex + 1) % grades.length;
            const newGrade = grades[currentGradeIndex];
            
            cell.textContent = newGrade.grade;
            cell.className = ''; // Clear previous classes
            cell.classList.add(newGrade.colorClass);
            
            // Retrieve the stored data attributes
            const studentID = cell.dataset.studentId;
            const description = cell.dataset.description;
            const objectId = cell.dataset.objectId;
            const studentName = studentMap[studentID];
            const overallMark = calculateOverallMark(studentName);

            calculateAndUpdateOverallSteps();
            
            console.log(studentID, objectId, description, newGrade.grade, overallMark);
            
            // Now you can use these values to update the database
            saveGradesToDatabase([{ _id: objectId, studentID, description, grade: newGrade.grade, overallMark: overallMark }]);
        }

        
        function applyFilter(data, filterList) {
            return data.filter(item =>
            (filterList.year !== null ? item.year === filterList.year : true) &&
            (filterList.class !== null ? item.class === filterList.class : true) &&
            (filterList.subject !== null ? item.subject === filterList.subject : true) &&
            (filterList.calenderYear !== null ? item.calenderYear === filterList.calenderYear : true)
            );
        }
        
        function createTable(filtered, studentMap, terms) {
            var table = document.getElementById("stepTable");
            table.innerHTML = "";
            var thead = table.createTHead();
            var headerRow = thead.insertRow();
            headerRow.insertCell().textContent = 'Step';
            headerRow.insertCell().textContent = 'Term';
            
            Object.values(studentMap).forEach(studentName => {
                const th = document.createElement("th");
                th.textContent = studentName;
                headerRow.appendChild(th);
            });
            
            var tbody = table.createTBody();
            
            // Ensure subStep is an array before mapping
            let subStepDescriptions = filtered.flatMap(item => Array.isArray(item.subStep) ? item.subStep.map(ss => ss.description) : []);
            subStepDescriptions = [...new Set(subStepDescriptions)]; // Unique descriptions
            
            subStepDescriptions.forEach(description => {
                terms.forEach(term => {
                    let dataExists = filtered.some(item => 
                        item.subStep && item.subStep.some(ss => ss.description === description && item.term === term)
                    );
        
                    if (dataExists) {
                        const row = tbody.insertRow();
                        row.insertCell().textContent = description;
                        row.insertCell().textContent = term;
                        
                        Object.keys(studentMap).forEach(studentID => {
                            const gradeCell = row.insertCell();
                            const studentGradeObject = filtered.find(item => item.studentID === studentID && item.term === term);
                            const studentGrades = studentGradeObject?.subStep;
                            const objectId = studentGradeObject?._id;
                            const gradeInfo = studentGrades?.find(ss => ss.description === description);
                            const grade = gradeInfo?.grade || '';
                            
                            gradeCell.textContent = grade;
                            gradeCell.classList.add(`grade-${grade}`);
                            gradeCell.dataset.studentId = studentID; // Set the studentID data attribute
                            gradeCell.dataset.description = description; // Set the description data attribute
                            gradeCell.dataset.objectId = objectId; // Set the objectId data attribute
                            
                            gradeCell.onclick = function() { cycleGrade(this); };
                        });
                    }
                });
            });

            document.getElementById("saveButton").addEventListener("click", function() {
                document.getElementById("stepTable").innerHTML = "";
                fetch('/getsteps')
                .then(response => response.json())
                .then(data => {
                    studentMap = data.reduce((map, item) => {
                        map[item.studentID] = item.studentName;
                        return map;
                    }, {});
        
                    terms = [...new Set(data.map(item => item.term))];

                    
                    const newdata = applyFilter(data, filterList);
                    console.log(filterList);
                    createTable(newdata, studentMap, terms);
                    calculateAndUpdateOverallSteps();
                });
            });
        }
        function calculateOverallMark(studentName) {
            const table = document.getElementById('stepTable');
            let gradeCounts = { 'S': 0, 'D': 0, 'E': 0, 'N': 0 };
        
            // Find the column index for the student name
            let col = Array.from(table.rows[0].cells).findIndex(cell => cell.textContent === studentName);
        
            // If col is -1, the student name was not found
            if (col === -1) {
                console.error('Student name not found in header cells:', studentName);
                return '0N'; // Return a default value
            }
        
            // Count the grades for the specific student
            for (let row = 1; row < table.rows.length; row++) {
                // Check if the cell exists
                if (table.rows[row].cells[col]) {
                    let grade = table.rows[row].cells[col].textContent.trim();
                    if (gradeCounts.hasOwnProperty(grade)) {
                        gradeCounts[grade]++;
                    }
                }
            }
        
            // Determine the most frequent grade
            let highestGrade = 'N';
            let highestCount = 0;
            for (const grade in gradeCounts) {
                if (gradeCounts[grade] > highestCount) {
                    highestGrade = grade;
                    highestCount = gradeCounts[grade];
                }
            }
            let overallMark = highestCount + highestGrade;
            console.log('Overall Mark for student', studentName, ':', overallMark);
            return overallMark;
        }
          

        // Event handler to update the table based on the current filters
        function updateTableWithFilters() {
            const filteredData = applyFilter(data, filterList);
            createTable(filteredData, studentMap, terms);
            calculateAndUpdateOverallSteps();
        }

        // Object to map grades to their respective values and color classes
        const gradesMapping = {
            'N': { value: 0.005, colorClass: 'grade-N' },
            'E': { value: 0.05, colorClass: 'grade-E' },
            'D': { value: 0.5, colorClass: 'grade-D' },
            'S': { value: 1, colorClass: 'grade-S' }
        };
        // Function to get the overall step description based on the calculated percentage
        function getOverallStepDescription(percentage) {
            if (percentage >= 91) return 'Very secure (S+)';
            if (percentage >= 81) return 'Secure (S)';
            if (percentage >= 71) return 'Approaching secure (S-)';
            if (percentage >= 61) return 'Highly developed (D+)';
            if (percentage >= 51) return 'Developing (D)';
            if (percentage >= 41) return 'Beginning to develop (D-)';
            if (percentage >= 31) return 'Emerged (E+)';
            if (percentage >= 21) return 'Emerging onto step (E)';
            if (percentage >= 11) return 'Just on step (E-)';
            return 'Step not reached';
        }
        

    // Function to calculate and update the overall step for each student
        // Function to calculate and update the overall step for each student
        function calculateAndUpdateOverallSteps() {
            const table = document.getElementById('stepTable');
            clearOverallStepRow(); // Clear any existing overall step row
            let overallRow = table.insertRow();
            overallRow.classList.add('overall-step-row');
            overallRow.insertCell().textContent = 'Overall Step'; // Label cell
        
            // Insert empty cells for the skipped column and students
            for (let i = 1; i < table.rows[0].cells.length; i++) {
                overallRow.insertCell(); // Insert a cell for alignment and students
            }
        
            // Calculate and update the overall step for each student
            for (let col = 2; col < table.rows[0].cells.length; col++) {
                let sum = 0;
                let count = 0;
                for (let row = 1; row < table.rows.length - 1; row++) {
                    let grade = table.rows[row].cells[col].textContent.trim();
                    if (gradesMapping.hasOwnProperty(grade)) {
                        sum += gradesMapping[grade].value;
                        count++;
                    }
                }

                // Calculate the percentage and update the cell's text content
                if (count > 0) {
                    let percentage = Math.ceil((sum / count) * 100);
                    let description = getOverallStepDescription(percentage);
                    overallRow.cells[col].textContent = `${percentage}% - ${description}`;
                } else {
                    overallRow.cells[col].textContent = 'Step not reached';
                }
            }
        }
        
        // Function to clear the overall step row
        function clearOverallStepRow() {
            const overallRow = document.querySelector('.overall-step-row');
            if (overallRow) {
                overallRow.remove();
            }
        }

        // Attach event listeners to filter elements for recalculating steps
        document.querySelectorAll('.filtered').forEach(filterElement => {
            filterElement.addEventListener('change', () => {// Clear the overall step row
                updateTableWithFilters(); // Update the table based on the filters
                calculateAndUpdateOverallSteps(); // Recalculate the steps
            });
        });
        function saveGradesToDatabase(gradesData) {
            gradesData.forEach(gradeUpdate => {
              const bodyData = {
                _id: gradeUpdate._id, // assuming _id is part of the gradeUpdate object
                subStepUpdates: [{
                  description: gradeUpdate.description,
                  grade: gradeUpdate.grade
                }],
                overallGrade: gradeUpdate.overallMark
              };
          
              fetch('/updateGrade', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                if (data.success) {
                  console.log('Grade updated in database successfully');
                  console.log(bodyData);
                } else {
                  console.error('Failed to update grade in database');
                }
              })
              .catch((error) => {
                console.error('Error updating grade:', error);
              });
            });
          }

          
 
    
    function clearFilter() {
      document.getElementById("Year").selectedIndex = 0;
      document.getElementById("Class").selectedIndex = 0;
      document.getElementById("Subject").selectedIndex = 0;
      document.getElementById("Calender Year").selectedIndex = 0;

      // Hide the title after clear the data
      var stepTrackTableTitle = document.getElementById("stepTrackTableTitle");
      stepTrackTableTitle.innerHTML = "";

      // reset inner html
      document.getElementById("stepTrackTable").innerHTML = "";
      document.getElementById("stepTable").innerHTML = "";
      document.getElementById("evidenceTable").innerHTML = "";


    }

    document.getElementById("clear").addEventListener("click", function() {
        clearFilter();
        filterList = {year: null, class: null, subject:null, calenderYear:null}
        var table = document.getElementById("stepTrackTable");
        var table1 = document.getElementById("stepTable");
        var table2 = document.getElementById("evidenceTable");
        var cardList = document.getElementById("studentCardList");
        table.innerHTML = "";
        table1.innerHTML = "";
        table2.innerHTML = "";
        cardList.innerHTML = "";

        cleanSection();
        clearOverallStepRow();
    })        
    

  .catch(error => {
      console.error('Error fetching JSON:', error);
  });
    });


  const alertTrigger = document.getElementById('SignupBtn')
  if (alertTrigger) {
      alertTrigger.addEventListener('click', () => {
          alert('Thank you for submitting the evidence.', 'success')
      })
  };

  const alertTrigger1 = document.getElementById('saveButton')
  if (alertTrigger1) {
      alertTrigger1.addEventListener('click', () => {
          alert('Thanks for submitting the Steps. \nPlease reload the page to update other tables.', 'success')
      })
  };



 // Event listener for the close button of the alert
// Since the button is created dynamically, use event delegation to attach the event
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-close')) {
        const alertPlaceholder = document.getElementById('alertPlaceholder');
        alertPlaceholder.innerHTML = ''; // Clear the alert placeholder
    }
});

function populateStudentDropdown(studentMap) {
    const studentSelect = document.getElementById('studentNameSelect');
    studentSelect.innerHTML = '<option value="">Select a student</option>'; // Clear current options

    // Add an option for each student in the map
    for (const [studentID, studentName] of Object.entries(studentMap)) {
        const option = document.createElement('option');
        option.value = studentID;
        option.textContent = studentName;
        studentSelect.appendChild(option);
    }
}

function populatetermDropdown(terms) {
    const termSelect = document.getElementById('termSelect');
    termSelect.innerHTML = '<option value="">Select Term</option>'; // Clear current options

    // Add an option for each term in the array
    terms.forEach(term => {
        const option = document.createElement('option');
        option.textContent = term;
        option.value = term; // It's important to set the value attribute
        termSelect.appendChild(option);
    });
}



function addClient(objectId, date, studentName, term, evidencetype, comment, evidenceFile) {

    if (!date || !evidencetype || !evidenceFile || !comment) {
        // If not, read the values from the form
        date = document.getElementById('evidencedate').value;
        studentName = document.getElementById('studentNameSelect').options[document.getElementById('studentNameSelect').selectedIndex].text;
        term = document.getElementById('termSelect').options[document.getElementById('termSelect').selectedIndex].text;
        evidencetype = document.getElementById('evidencetype').value;
        evidenceFile = document.getElementById('evidenceFile').value;
        comment = document.getElementById('comment').value;
        console.log('Evidence File:', evidenceFile);
    }
    // Check if all the required fields have values
    if (date !== "" && evidencetype !== "Select Evidence" && comment !== "") {
        // Create a new row and cells
        var tr = document.createElement('tr');
        tr.setAttribute('data-id', objectId);
        tr.setAttribute('data-evidencefile', evidenceFile); 
        var td1 = tr.appendChild(document.createElement('td'));
        var td2 = tr.appendChild(document.createElement('td'));
        var td3 = tr.appendChild(document.createElement('td'));
        var td4 = tr.appendChild(document.createElement('td'));
        var td5 = tr.appendChild(document.createElement('td'));
        var td6 = tr.appendChild(document.createElement('td'));
        var td7 = tr.appendChild(document.createElement('td'));
        var td8 = tr.appendChild(document.createElement('td'));

        // Assign the input values to the cells
        td1.textContent = date;
        td2.textContent = studentName;
        td3.textContent = term;
        td4.textContent = evidencetype;
        td5.textContent = comment;
        td6.value = evidenceFile;

        td6.innerHTML = '<a href="pages/stepTrack/SampleExam.png" download><i class="bi bi-file-earmark-check"></i></a>';
        td7.innerHTML = '<input type="button" value="Update" onclick="UpClient(this);" class="btn btn-success">';
        td8.innerHTML = '<input type="button" value="Delete" onclick="delClient(this);" class="btn btn-danger">';

        // Append the new row to the table
        document.getElementById("studentCardList").appendChild(tr);

        // Optionally clear the form if the data was added from the form
    } else {
        // If some fields are missing, alert the user
        alert("Please fill in all the fields.");
    }
}

/*This is a function to add client into the Submit list through Js.*/
function UpClient(btn) {

    var tr = btn.parentNode.parentNode;
    var cells = tr.children;

    // Assuming the structure of your table, adjust the indices if necessary
    cells[0].innerHTML = '<input type="date" name="evidencedate1" value="' + cells[0].textContent + '">';
    cells[1].innerHTML = cells[1].textContent;
    cells[2].innerHTML = cells[2].textContent;
    cells[3].innerHTML = '<input type="text" name="evidencetype1" value="' + cells[3].textContent + '">';
    cells[4].innerHTML = '<input type="text" name="comment1" value="' + cells[4].textContent + '">';
    cells[5].innerHTML = '<input type="file" name="evidenceFile1">';
    console.log("UpClient:",cells[5].value);
    cells[6].innerHTML = '<input type="button" value="Save" onclick="saveUpdatedClient(this);" class="btn btn-success">';

    
    // Keep the delete button as it is
}

function updateEvidenceToDatabase(evidenceUpdate) {
    fetch('/updateEvi', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(evidenceUpdate)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Evidence updated in database successfully');
            // Update the UI accordingly or give a success message
        } else {
            console.error('Failed to update evidence in database');
            // Show an error message to the user
        }
    })
    .catch((error) => {
        console.error('Error updating evidence:', error);
    });
}
  

  
/*This is a function to add client into the Submit list through Js.*/

// Implement the saveUpdatedClient function to finalize the update
function saveUpdatedClient(btn) {
    var tr = btn.parentNode.parentNode;
    var objectId = tr.getAttribute('data-id');
    var evidenceFile = tr.getAttribute('data-evidencefile');
    var inputs = tr.querySelectorAll('input:not([type=button]), select, textarea');

    // Update the table row with new input values
    tr.cells[0].textContent = inputs[0].value; // Date
    tr.cells[3].textContent = inputs[1].value; // Comment
    tr.cells[4].textContent = inputs[2].value; // Comment
    // Restore the Update and Delete buttons
    tr.cells[5].innerHTML = '<a href="pages/stepTrack/SampleExam.png" download><i class="bi bi-file-earmark-check"></i></a>';
    tr.cells[6].innerHTML = '<input type="button" value="Update" onclick="UpClient(this);" class="btn btn-success">';
    console.log("saveUpdatedClient:", tr.cells[5].value);
    // Delete button remains unchanged

    // Update the database with the new values
    var evidenceUpdate = {
        _id: objectId,
        date: inputs[0].value,
        studentName: tr.cells[1].textContent,
        term: tr.cells[2].textContent,
        evidencetype: inputs[1].value,
        comment: inputs[2].value,
        evidenceFile: evidenceFile
    };

    updateEvidenceToDatabase(evidenceUpdate);
    console.log(evidenceUpdate)
}

/*This is a function to remove the client information from the Submit list through Js.*/
function delClient(btn) {
    var tr = btn.parentNode.parentNode;
    tr.parentNode.removeChild(tr);
}

function clearForm() {
    document.getElementById("evidencetype").selectedIndex = 0;
    document.getElementById("evidencedate").value = "";
    document.getElementById("evidenceFile").value = "";
    document.getElementById("comment").value = "";
}


document.getElementById("clearform").addEventListener("click", function() {
    clearForm();
})


/* hide step and evidence function */
function showSection(showId, hideId) {
    var showSection = document.getElementById(showId);
    var hideSection = document.getElementById(hideId);
    var defaulttable = document.getElementById("defaulttable");

    // Show the specified section
    showSection.style.display = "block";
    defaulttable.style.display = "none";
    
    // Hide the another section
    hideSection.style.display = "none";
}

function cleanSection(){
    var defaulttable = document.getElementById("defaulttable");
    var Steps = document.getElementById("Steps");
    var Evidences = document.getElementById("Evidences");

    defaulttable.style.display = "block";
    Steps.style.display = "none";
    Evidences.style.display = "none";
}