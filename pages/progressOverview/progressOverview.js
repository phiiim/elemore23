document.getElementById("progressOverview").classList.add('active')

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
    /*const listItem = document.createElement('option');
    listItem.value = 'none';
    listItem.textContent = 'none';
    parentElement.appendChild(listItem);
    parentElement.selectedValue = 'none';*/
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
    //appendListItems('Student',studentsList)

    var ctx = document.getElementById('chart').getContext('2d');
    var progressChart;
    var prevData;
    var prevLabels;
    let graphData = []; 
    // CREATE GRAPH ----------------------------------------------------------------------------------------------------------
    function generateData()
    {

      
      var filtered = Object.assign({}, data);
      filtered = data.filter(item =>
        ((filterList.year !== null)  ? item.year === filterList.year : true) &&
        ((filterList.class !== null) ? item.class === filterList.class : true) &&
        ((filterList.calenderYear !== null)  ? item.calenderYear === filterList.calenderYear : true) &&
        //THIS IS BROKEN VVVV
        ((filterList.studentName !== null)  ? item.studentName === filterList.studentName : true) &&
        ((filterList.subject !== null)  ? item.subject === filterList.subject : true)
        
    );


      const filterInfo = document.getElementById("filterInfo");

      const filterInfoTwo = document.getElementById("filterInfoTwo");
    
    //const filterInfo1 =  Object.entries(filterList).filter(([key,value]) => value != null);
    var filterInformation = '';
    //filterInfo.textContent = JSON.stringify(filterInfo1);
    //filterInfo.style.display = "block";
    //console.log('hello');
    //alert('FINFO' + filterInfo1);
    for (const filter in filterList)
    {

      if (filterList[filter] != null)
      {
        filterInformation = filterInformation + filter + ': ' + filterList[filter] + ', ';
      }


      
    }
    filterInformation = filterInformation.substring(0,filterInformation.length - 2);

    /*if (create)
    {
      textBoxOne = document.getElementById("textBoxOne");
      textBoxOne.style.display = "block";
      filterInfo.textContent = filterInformation;
      filterInfo.style.display = "block";      
    }
    else
    {
      textBoxTwo = document.getElementById("textBoxTwo");
      textBoxTwo.style.display = "block";
      filterInfoTwo.textContent = filterInformation;
      filterInfoTwo.style.display = "block";
    }*/


    let terms = filtered.map(item => item.term);

    // need to order by year and then order by term 


    filtered.sort(function(a,b)
    {
      var terms = {spring:1, summer:2,autumn:0}
      return a.calendarYear - b.calendarYear || terms[a.term] - terms[b.term];
    }
    )

    var date = filtered.map(item => `${item.term} ${item.calenderYear}`);
    var uniqueDates = [...new Set(filtered.map(item => `${item.term} ${item.calenderYear}`))];
   
    var grades = filtered.map(item => item.overallGrade);


      const uniqueTerms = [...new Set(filtered.map(item => item.term))];
      const termAverage = [];

      uniqueTerms.forEach(function(term)
      {

        const students = filtered.filter(item => item.term == term)
        const termGrades = students.map(student => student.overallGrade);

        termAverage.push(classAverage(termGrades));

      });
//if selecting class filter change students so that only shows students from that class
// map to average so it works for groups 
// need to change none back 
alert('jo')
    var label; 
    if (filterList.studentName !== null)
    {
      label = filterList.studentName
    }

    const colours = ["#e43202","#3cba9f","#ffc722","#bf7eff","#9bff85","#fffa6d","#4673ff","#ada7a7","#002eb2","#722f88"];
    alert(graphData.length + 'GD length');
    const graphInfo = 
    {
      label: label,
      data: termAverage,
      borderWidth: 1,
      borderColor : colours[graphData.length]
    }

    //put filterInformation on screen of user
    const filterBox = document.createElement("div");
    filterBox.classList.add()



      // add corresponding colour next to info 
      resetFilter(filterList);
      alert('Done');
      return [graphInfo,uniqueDates];
    }
    // CREATE GRAPH--------------------------------------------------------------------------------------------------
//APPLY FUNCTION----------------------------------------------------
    document.getElementById("apply").addEventListener("click", function() {
      if (graphData.length === 10)
      {
        alert('Too many graphs - please get rid of one before applying');
      }
      else
      {
      const [graphInfo,uniqueDates] = (generateData());
      graphData.push(graphInfo);

      var ctx = document.getElementById('chart').getContext('2d');
      alert('hello!x')
      if (progressChart)
      {
        alert('hello>')
        progressChart.destroy();
      }
    
      
       progressChart = new Chart(ctx,
        {
          type: 'line',
          data: {
            labels: uniqueDates,
            datasets: 
              graphData
              
            
            
          },
    
          options:
          {
            responsive:false,
            scales: 
            {
              y:
              {
                ticks: 
                {
                  beginAtZero: true,
                  min: 0,
                  max: 20,
                  stepSize:1,
                  callback:function(label,index,labels)
                  {
    
                    var grades = ['N','E','D','S']
                    var gradeLetter = grades[label % 4];
                    var gradeNum = Math.floor(label / 4) + 1;
                    
                    return gradeNum + gradeLetter;
                  }
                }
    
              }
            }
          }
    
        }
      
        
        )
      }
    });



    

  })

  .catch(error => {
      console.error('Error fetching JSON:', error);
  });

  
//END OF APPLY FUNCTION-----------------------------------------------------------------------------


// compare function----------------------------------------------------------------------------------


// end of compare function---------------------------------------------------------------------------


// sort the term dates


function gradeToNumerical(grade)
{

  var letterValues = {'N':0,'E':1,'D':2,'S':3};
  var number = parseInt(grade.charAt(0));
  var letter = grade.charAt(1);
  var numericalVal = ((number - 1) * 4) + letterValues[letter];
  return numericalVal;
}



function classAverage(classData)
{

  var sum = 0;
  classData.forEach(function(item,idx)
  {
  
    value = gradeToNumerical(item);
    sum += value;
  }
  );
  return Math.round(sum/classData.length);
}

function resetFilter(list)
{

  Object.keys(list).forEach(function(key)
  {
    const selectElement = document.getElementById(key);
    selectElement.selectedIndex = 0;
  }
  )
}

