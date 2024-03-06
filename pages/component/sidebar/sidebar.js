class Sidebar extends HTMLElement{
    constructor() {
        super()
        this.innerHTML = `
            <section class="sidebar">
                <div class="side-head">
                    <img class="logo" src="../../component/img/Elemore-Hall-School.png" alt="">
                </div>
                <hr>
                <div class="side-content">
                    <a id="stepTrack" class="page" href="../stepTrack/stepTrack.html">
                        <span class="material-symbols-outlined icon">
                            import_contacts
                        </span>
                        <span class="page-des">Step Tracker</span>
                    </a>
                    <a id="progressOverview" class="page" href="../progressOverview/progressOverview.html">
                        <span class="material-symbols-outlined icon">
                            trending_up
                        </span>
                        <span class="page-des">Progress Overview</span>
                    </a>
                    <a id="numTrack" class="page" href="../numTrack/numTrack.html">
                        <span class="material-symbols-outlined icon">
                            pin
                        </span>
                        <span class="page-des">Literacy & Numeracy Tracker</span>
                    </a>
                    <a id="subjectOverview" class="page" href="../subjectOverview/subjectOverview.html">
                        <span class="material-symbols-outlined icon">
                            summarize
                        </span>
                        <span class="page-des">Subject Target & Progress Overview</span>
                    </a>
                    <a id="progressReport" class="page" href="../progressReport/progressReport.html">
                        <span class="material-symbols-outlined icon">
                            contract
                        </span>
                        <span class="page-des">Progress Report</span>
                    </a>
                </div>
            </section>
        `
    }
}

customElements.define("side-bar", Sidebar)