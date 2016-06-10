/// <reference path="C:\Users\Sathyamoorthy\Desktop\react.d.ts" />

var showToastMessage = function name() {
    $(".toastMessageBox").removeClass("hideContent");
    //Toast the message for only 2 seconds
    setTimeout(function () {
        $(".toastMessageBox").addClass("hideContent");
    }, 2000);
};

var Instructors = React.createClass({
    render: function () {
        return (
            <div className="instructors">
                {
                    this.props.listItems.map(function (item) {
                        return (
                            <span className="instructor">{item}</span>
                        );
                    })
                }
            </div>
        );
    }
});
var Partners = React.createClass({
    render: function () {
        return (
            <div className="partners">
                {
                    this.props.listItems.map(function (item) {
                        return <div className="partner">{item}</div>
                    })
                }
            </div>
        )
    }
})
var CourseList = React.createClass({
    render: function () {
        return (
            <ul className="courseList centerize">
                {
                    this.props.listItems.map(function (item) {
                        return (
                            <li className="clearFix courseItem">
                                <div>
                                    <img src = {item.photoUrl} className="avatar"/>
                                </div>
                                <div className="courseName">{item.name}</div>
                                <Instructors listItems={item.instructorNames} />
                                <Partners listItems={item.partnerNames} />
                            </li>
                        )
                    })
                }
            </ul>
        );
    }
});
var Mock = React.createClass({
    getInitialState: function () {
        return ({
            elementsToShow: []
        })
    },
    loadPage: function (pageNum) {
        //pages wont reload if pageNum higher than total pages and pageNum less than 1 
        if ((pageNum > 0) && (pageNum <= this.state.numPages)) {
            $("body").animate({ scrollTop: 0 }, 500);
            var itemsToShow = this.state.elements.slice((pageNum - 1) * 10, ((pageNum - 1) * 10) + 10);
            this.setState({
                elementsToShow: itemsToShow,
                pageNum: pageNum
            });
            var pagenum = this.state.pageNum;
            $(".pageNum").val(pageNum);
        }
        else {
            this.setState({
                msg: "Inavalid Page Number"
            });
            showToastMessage();
            var pageNum = this.state.pageNum;
            $(".pageNum").val(pageNum);
        }
    },
    searchFunctionality: function () {
        $(".searchInput").blur();
        //show the loader icon
        $(".contentLoading").removeClass("hideContent");
        var keyword = $(".searchInput").val().replace(" ", "+");
        var url = "https://api.coursera.org/api/courses.v1?q=search&query=" + keyword + "&includes=instructorIds,partnerIds&fields=instructorIds,partnerIds,instructors.v1(firstName,lastName,suffix),photoUrl";

        $.get(url)
            .done(function (data) {
                var elements = data.elements,
                    elementsCount = data.elements.length,
                    instructors = data.linked["instructors.v1"],
                    partners = data.linked["partners.v1"];
                //add new fields into elements - partner names and instructor names
                for (var i = 0; i < elementsCount; i++) {
                    var currentElement = elements[i],
                        elmInstructorsIds = currentElement.instructorIds,
                        instructorsIdsCount = currentElement.instructorIds.length,
                        instructorflag = 0;
                    currentElement.instructorNames = [];
                    //find instructor names
                    for (var j = 0; j < instructors.length; j++) {
                        for (var k = 0; k < instructorsIdsCount; k++) {
                            if (instructors[j].id == elmInstructorsIds[k]) {
                                instructorflag++;
                                var instructorName = instructors[j].firstName + " " + instructors[j].lastName;
                                currentElement.instructorNames.push(instructorName);
                            }
                        }
                        //limit the instructors to 2 if it has more 
                        if (instructorflag == instructorsIdsCount || instructorflag == 2) {
                            break;
                        }

                        else {
                            console.log("elem not founs");
                        }
                    }
                    //find partner names
                    var elmPartnerIds = currentElement.partnerIds,
                        partnerIdsCount = currentElement.partnerIds.length,
                        partnerflag = 0;
                    currentElement.partnerNames = [];
                    for (var j = 0; j < partners.length; j++) {
                        for (var k = 0; k < partnerIdsCount; k++) {
                            if (partners[j].id == elmPartnerIds[k]) {
                                partnerflag++;
                                currentElement.partnerNames.push(partners[j].name);
                                if (partnerflag == partnerIdsCount) {
                                    break;
                                }
                            }
                        }

                    }

                    currentElement.photoUrl += "?auto=format&dpr=1&w=100&h=100&fit=fill&bg=FFF";
                }
                //calculating page numbers
                var pages = Math.ceil(elementsCount / 10);
                this.setState({
                    elements: elements,
                    numPages: pages
                });
                if (this.state.numPages) {
                    this.loadPage(1);
                    console.log(data);
                    //set the page number 
                    $(".pageNum").val(1);
                    //stop the loading
                    $(".contentLoading").addClass("hideContent");

                    $(".pageNav").removeClass("hideContent");
                    
                    this.setState({
                        msg: elementsCount + " matches found"
                    });
                    showToastMessage();
                }
                else{
                    this.setState({
                        msg: "no matches found",
                        elementsToShow: [ ]
                    });
                    showToastMessage();
                    $(".contentLoading").addClass("hideContent");
                    $(".pageNav").addClass("hideContent");
                }

            }.bind(this))
            .fail(function () {

            });
    },
    searchEnter: function (e) {
        if (e.keyCode == 13) {
            this.searchFunctionality();
        }
    },
    searchInputOnFocus: function () {
        $(".searchBar").addClass("searchBarf");
    },
    searchInputOnBlur: function () {
        $(".searchBar").removeClass("searchBarf");
    },
    pageNav: function (e) {
        e.preventDefault();

        if (e.target.id == "prevPage") {
            //do nothing if page is in 1
            if (!(this.state.pageNum == 1)) {
                this.loadPage(parseInt(this.state.pageNum) - 1);
            }
        }
        if (e.target.id == "nextPage") {
            //do nothing if it is in last page
            if (!(this.state.pageNum == this.state.numPages)) {
                this.loadPage(parseInt(this.state.pageNum) + 1);
            }
        }
    },
    pageNumOnKeyUp: function (e) {
        if (e.keyCode == 13) {
            var enteredPageNum = $(".pageNum").val();
            if (enteredPageNum != "") {
                this.loadPage(enteredPageNum);
            }
            else {
                this.setState({
                    msg: "Invalid Page Number"
                });
                showToastMessage();
                var pageNum = this.state.pageNum;
                $(".pageNum").val(pageNum);
            }
            e.target.blur();
        }

    },
    render: function () {
        return (<div>
            <div className="searchBar centerize">
                <div className="searchImg" onClick={this.searchFunctionality}>
                    <span className="searchIcon"></span>
                </div>
                <input className="searchInput" type="text" placeholder="Search Any Topic" onFocus={this.searchInputOnFocus} onBlur={this.searchInputOnBlur} onKeyUp={this.searchEnter}/>
            </div>
            <div className="contentLoading hideContent">
                <div className="ball centerize"></div>
            </div>
            <CourseList listItems={this.state.elementsToShow} />
            <div className="pageNav centerize hideContent">
                <a className="prevPage" id="prevPage" onClick={this.pageNav}>prev</a>
                <input className="pageNum" type="text" onKeyUp={this.pageNumOnKeyUp}/>
                <span>of </span>
                <span className="totalPages">{this.state.numPages}</span>
                <a className="nextPage" id="nextPage"  onClick={this.pageNav}>next</a>
            </div>
            <div className="hideContent toastMessageBox clearFix" id="toastMessageBox"><div className="toast">{this.state.msg}</div></div>
        </div>);
    }
});

ReactDOM.render(<Mock />, document.getElementById("appContent"));