const { jsPDF } = window.jspdf;

document.getElementById("progressReport").classList.add('active')

function getCurrentDate() {
  const currentDate = new Date();

  // Get day, month, and year
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();

  // Concatenate the date parts with '/'
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}

function generatePDF(filtered, studentName, currTerm) {
  const doc = new jsPDF();

  // Define table settings
  const cellWidth = 40;
  const cellHeight = 10;
  const xOffset = 20;
  const yOffset = 20;
  const headerHeight = 10;

  // Get unique subjects and terms
  const uniqueSubjects = [...new Set(filtered.map(item => item.subject))];
  const uniqueTerms = [...new Set(filtered.map(item => item.term))];

  // Define the custom order for terms
  const termOrder = ['autumn', 'spring', 'summer'];

  // Sort the uniqueTerms array based on the custom order
  uniqueTerms.sort((a, b) => termOrder.indexOf(a) - termOrder.indexOf(b));

  // Calculate table dimensions
  const numCols = uniqueTerms.length;
  const numRows = uniqueSubjects.length;

  doc.setFontSize(20);
  doc.text('Pupil Progress Report', xOffset, yOffset - 10);

  // Add 'Elemore Hall School' to top right
  doc.text('Elemore Hall School', doc.internal.pageSize.getWidth() - doc.getStringUnitWidth('Elemore Hall School') *9, yOffset - 10);

  // Add name and term above the table
  doc.setFontSize(14);
  doc.text(`Name: ${studentName}`, xOffset, yOffset );
  doc.text(`Term:  ${currTerm}`, xOffset, yOffset +6);
  doc.text(`Date:  ${getCurrentDate()}`, xOffset, yOffset +12);

  // Draw table headers
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  uniqueTerms.forEach((term, colIndex) => {
    doc.text(xOffset + (colIndex + 1) * cellWidth, yOffset +15 + headerHeight, term);
  });
  uniqueSubjects.forEach((subject, rowIndex) => {
    doc.text(xOffset - 5, yOffset +15 + (rowIndex + 2) * cellHeight, subject);
  });

  // Fill in cell values
  doc.setFont('helvetica', 'normal');
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const grade = filtered.find(item => item.subject === uniqueSubjects[row] && item.term === uniqueTerms[col])?.overallGrade || '';
      doc.text(xOffset + (col + 1) * cellWidth, yOffset +15 + (row + 2) * cellHeight, grade);
    }
  }

  // Save the document
  doc.save(`${studentName} Progress Report.pdf`);            
}      


fetch('/getsteps')
  .then(response => response.json())
  .then(data => {
    var filterList = {year: null, class: null, calenderYear:null}

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

    let calenderlist = [...new Set(data.map(item => item.calenderYear))];
    calenderlist.sort();

    appendListItems('Year', yearsList);
    appendListItems('Class', classList);
    appendListItems('Calender Year', calenderlist);

    document.getElementById("apply").addEventListener("click", function() {
      var filtered = Object.assign({}, data);
      filtered = data.filter(item =>
        (filterList.year !== null ? item.year === filterList.year : true) &&
        (filterList.class !== null ? item.class === filterList.class : true) &&
        (filterList.calenderYear !== null ? item.calenderYear === filterList.calenderYear : true)
    );
      console.log(filtered)
      const uniqueStudentIDs = [...new Set(filtered.map(item => item.studentID))];
      
      const cardList = document.getElementById('card-list');
      cardList.innerHTML = ''
      uniqueStudentIDs.forEach((studentID) => {
        
          const student = filtered.find(item => item.studentID === studentID);
          
          const itemTemplate = `<div class="card">
          <span>${student.studentID} ${student.studentName}</span>
          <button type="button" class="btn btn-secondary download" >download</button>     
        </div>`;
          cardList.innerHTML += itemTemplate;
        });
      
      const downlaodList = document.getElementsByClassName('download')
      
      uniqueStudentIDs.forEach((studentID, index) => {
        downlaodList[index].addEventListener("click", function() {
          const resultArray = [];
          const studentData = filtered.filter(item => item.studentID === uniqueStudentIDs[index]);
          const uniqueSubjects = [...new Set(data.map(item => item.subject))];
          const uniqueTerms = [...new Set(data.map(item => item.term))];

          // Define the custom order for terms
          const termOrder = ['autumn', 'spring', 'summer'];

          // Sort the uniqueTerms array based on the custom order
          uniqueTerms.sort((a, b) => termOrder.indexOf(a) - termOrder.indexOf(b));

          uniqueSubjects.forEach(subject => {
            // Iterate over each unique term
            uniqueTerms.forEach(term => {
              // Find the matching object in the original data
              const matchingObject = studentData.find(item => item.studentID === studentID && item.subject === subject && item.term === term);
              
              // If a matching object is found, add it to the resultArray
              if (matchingObject) {
                resultArray.push({
                  subject: subject,
                  term: term,
                  overallGrade: matchingObject.overallGrade
                });
              }
            });
          });

          const studentName = studentData[0].studentName
          const currTerm = resultArray[resultArray.length-1].term

        

          generatePDF(studentData, studentName, currTerm)
        })
      });
      
    });
  })

  .catch(error => {
      console.error('Error fetching JSON:', error);
  });
