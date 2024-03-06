document.getElementById("subjectOverview").classList.add('active')


let globalLitData;



fetch('/getlit/num')
.then(response => response.json())
.then(litdata => {
  globalLitData = litdata;
  
  // Call functions to populate filters and tables with the retrieved data
})
.catch(error => {
  console.error('Error fetching data:', error);
});

fetch('/getsteps')
  .then(response => response.json())
  .then(data => {


    
    var filterList = {year: null, class: null, subject:null, calenderYear:null, studentName:null}

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
      if (selectedOption.value == parentElementId || selectedOption.index==0){
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
      const field = parentElementId;
      console.log(`${field} == ${selectedValue}`);
      filterList[field] = selectedValue
      console.log(filterList)
    }


    let yearsList = [...new Set(data.map(item => item.year))];
    yearsList.sort();

    let classList = [...new Set(data.map(item => item.class))];
    classList.sort();

    let calenderList = [...new Set(data.map(item => item.calenderYear))];
    //calenderlist.sort();

    let studentsList = [...new Set(data.map(item => item.studentName))];
    //studentsList.sort();

    let subjectList = [...new Set(data.map(item => item.subject))];

    
    appendListItems('year', yearsList);
    appendListItems('class', classList);
    appendListItems('calenderYear', calenderList);
    appendListItems('studentName', studentsList );
    appendListItems('subject',subjectList)


    document.getElementById("apply").addEventListener("click", function() {

      var filtered = Object.assign({}, data);
      filtered = data.filter(item =>
        ((filterList.year !== null)  ? item.year === filterList.year : true) &&
        ((filterList.class !== null) ? item.class === filterList.class : true) &&
        ((filterList.calenderYear !== null)  ? item.calenderYear === filterList.calenderYear : true) &&
        //THIS IS BROKEN VVVV
        ((filterList.studentName !== null)  ? item.studentName === filterList.studentName : true) &&
        ((filterList.subject !== null)  ? item.subject === filterList.subject : true)
        
    );
 
 
    
    let students = filtered.map(item => item.studentName);
    let uniqueStudentIDs =    [...new Set(filtered.map(item => item.studentID))];

    const table = document.querySelector("#subjectoverviewTable tbody");
    //const columns = ['studentName','LAC','PP','WRAT_SA','WRAT_WRA'];
    const columns = ['studentName','LAC','PP'];
    const columnsSteps = ['overallGrade'];
    const placeHolders = [7,9,11,15,14,16];
    table.innerHTML = '';

    uniqueStudentIDs.forEach((student,studentIndex) => {

      let gradeRecord =  data.filter(data => data.studentID === student);
      let litRecord = globalLitData.filter(globalLitData => globalLitData.studentID == student);

      if (litRecord == null || litRecord.length === 0)
      {
        console.log('No matching data found')
      }
      else
      {

        const row = document.createElement("tr");
        const studentCell = document.createElement("td");

        
        /*const LAC = document.createElement("td");
        LAC.textContent = litRecord[0].LAC;
        //make a list for the different things maybe??
        row.appendChild(LAC);
        table.appendChild(row);*/
        columns.forEach((header,headerIndex) => {
          const cell = document.createElement("td");
          cell.textContent = litRecord[0][header];
          row.appendChild(cell);
        }
        );

        cell = document.createElement("td");
        cell.textContent = placeHolders[studentIndex];
        row.appendChild(cell);
        cell = document.createElement("td");
        cell.textContent = placeHolders[studentIndex];
        row.appendChild(cell);
        columnsSteps.forEach((header,headerIndex) => {
          cell = document.createElement("td");
          cell.textContent = gradeRecord[0][header];
          row.appendChild(cell);
        }
        );

        table.appendChild(row);
      }
    }
    )
    });
  }) 



  // fetch litnum info 
  //map name to wrat scores
  // loop through each student and create new row and fill with data
  // should be simple!!!

function populateTables()
{

  data.forEach((student,studentIndex) => {


  }
  
  )
}

