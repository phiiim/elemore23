document.getElementById("numTrack").classList.add('active');

// Fetch data and populate filters and tables
fetch('/getlit/num')
  .then(response => response.json())
  .then(data => {
    // Call functions to populate filters and tables with the retrieved data
    populateFilters(data);
    populateTables(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

// Function to populate filters
function populateFilters(data) {
  var filterList = { year: null, class: null, calenderYear: null };

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
      var selectedValue = selectedOption.value !== parentElementId ? selectedOption.value : null;
      filterListener(selectedValue, parentElementId);
    });
  }

  function filterListener(selectedValue, parentElementId) {
    const field = parentElementId.toLowerCase();
    console.log(`${field} == ${selectedValue}`);
    filterList[field] = selectedValue;
    console.log(filterList);
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
    var filtered = data.filter(item =>
      (filterList.year !== null ? item.year === filterList.year : true) &&
      (filterList.class !== null ? item.class === filterList.class : true) &&
      (filterList.calenderYear !== null ? item.calenderYear === filterList.calenderYear : true)
    );
    console.log(filtered);
    // Call populateTables with the filtered data
    populateTables(filtered);
  });
}



// Function to populate tables and make them editable
function populateTables(data) {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data:', data);
    return;
  }

  // Define the table IDs
  const tableIds = ['WRAT_WRA', 'WRAT_NPR', 'WRAT_SA', 'AR_RA'];
  
  tableIds.forEach((tableId, index) => {
    const table = document.querySelector(`#${tableId} tbody`);

    table.innerHTML = '';

    // Loop through each student in the data
    data.forEach((student, studentIndex) => {
      if (!student || !student[tableId]) {
        console.error(`Invalid student or property '${tableId}' not found in student:`, student);
        return;
      }

      // Create a new row
      const row = document.createElement('tr');

      // Add student name
      const nameCell = document.createElement('td');
      nameCell.textContent = student.studentName;
      row.appendChild(nameCell);

      // Add scores for each year
      for (let i = 0; i < 5; i++) {
        const scoreCell = document.createElement('td');
        const scoreInput = document.createElement('input');
        scoreInput.type = 'text';
        scoreInput.value = student[tableId][i];
        scoreInput.addEventListener('input', createInputHandler(studentIndex, tableId, i));
        scoreCell.appendChild(scoreInput);
        row.appendChild(scoreCell);
      }

      // Append the row to the table body
      table.appendChild(row);
    });
  });




let updatedDocumentIDs = [];

function createInputHandler(studentIndex, tableId, scoreIndex) {
    return function(event) {
        const newValue = parseFloat(event.target.value);
        data[studentIndex][tableId][scoreIndex] = newValue;
        console.log('Updated data:', data);

        const documentID = data[studentIndex]._id;
        if (!updatedDocumentIDs.includes(documentID)) {
            updatedDocumentIDs.push(documentID);
            console.log(updatedDocumentIDs)
        }
    };
}

document.getElementById('saveScores').addEventListener('click', function() {
  fetch('/updateData', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updatedData: data, updatedDocumentIDs: updatedDocumentIDs })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to save scores');
      }
      return response.json();
  })
  .then(data => {
      console.log('Data updated successfully:', data);
      alert('Scores saved successfully!');
  })
  .catch(error => {
      console.error('Error updating data:', error);
      alert('Failed to save scores. Please try again later.');
  });
});



}







