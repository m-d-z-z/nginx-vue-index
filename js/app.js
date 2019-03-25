function PathJoiner(path, name, endSlash) {
    let dir = '';
    let domain = "/download";
    dir += path;
    if (!path.endsWith('/')) {
        dir += '/';
    }
    if (endSlash && !name.endsWith('/')) {
        dir += encodeURIComponent(name);
        dir += "/";
    } else if (!endSlash && name.endsWith('/')) {
        dir += encodeURIComponent(name.substring(0, name.length - 1));
        dir = domain + dir;
    } else if (name !== '/') {
        dir += encodeURIComponent(name);
        dir = domain + dir;
    }
    return dir;
}

function in_array(search,array){
    for(let i in array){
        if(array[ i ] === search){
            return true;
        }
    }
    return false;
}

Vue.component('node-sort', {
    template: `
        <div>
            <div @click="toggle('name')" class="col name full" style="border-radius: 5px 0 0 0; background-color: #e8e8e8">文件名</div>
            <div @click="toggle('size')" class="col size " style="background-color: #e8e8e8">大小</div>
            <div @click="toggle('date')" class="col date " style="border-radius: 0 5px 0 0; background-color: #e8e8e8">日期</div>
        </div>
       
        <!--<li class="list-group-item node-sort clearfix">-->
            <!--<div class="clearfix">-->
                <!--<div class="col sign" @click="sort.by = null" :class="{'sorted-active': sort.by != null}">-->
                    <!--<i class="glyphicon glyphicon-refresh"></i>-->
                <!--</div>-->
                <!--<div class="col name" @click="toggle('name')" :class="{'sorted-active' : sort.by == 'name'}">-->
                    <!--<i class="glyphicon" :class="{'glyphicon-arrow-up': sort.asc, 'glyphicon-arrow-down': !sort.asc}"></i>-->
                    <!--<span>文件名</span>-->
                <!--</div>-->
                <!--<div class="col size" @click="toggle('size')" :class="{'sorted-active' : sort.by == 'size'}">-->
                    <!--<i class="glyphicon" :class="{'glyphicon-arrow-up': sort.asc, 'glyphicon-arrow-down': !sort.asc}"></i>-->
                    <!--<span>大小</span>-->
                <!--</div>-->
                <!--<div class="col date" @click="toggle('date')" :class="{'sorted-active' : sort.by == 'date'}">-->
                    <!--<i class="glyphicon" :class="{'glyphicon-arrow-up': sort.asc, 'glyphicon-arrow-down': !sort.asc}"></i>-->
                    <!--<span>日期</span>-->
                <!--</div>-->
            <!--</div>-->
        <!--</li>-->
    `,
    data: function() {
        return {
            sort: {
                by: null,
                asc: true
            }
        }
    },
    methods: {
        toggle: function(by) {
            if (by == this.sort.by) {
                this.sort.asc = !this.sort.asc;
            } else {
                this.sort.by = by;
            }
        }
    },
    watch: {
        sort: {
            handler: function() {
                this.$emit('input', this.sort);
            },
            deep: true
        }
    }
});

Vue.component('node-search', {
    template: `
        <a class="input-group-addon" @click="closed = !closed"><i class="fa fa-search"></i></a>
        <div class="node-search" :class="{closed: closed}">
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" placeholder="Search" :value="value" @input="$emit('input', $event.target.value)">
            </div>
        </div>
    `,
    data: function() {
        return {
            closed: true,
        }
    },
    props: ['value']
});

Vue.component('node', {
    template: `
        
        <div class="node" :style="{backgroundColor: '#EEEEEE'}">
            <div v-show="name !== '/' && count === 0">
                <div class="col icon">
                    <span class="openLink">
                        <i :class="'fa fa-reply'"></i>
                    </span>
                </div>
                <div class="col name" :style="{width: 'calc(50% - 40px)'}">
                    <a :href="url + '../'" @click="RootNode.goTo(path, '../')" class="fileLink">../(上一级)</a>
                </div>
                <div class="col size"></div>
                <div class="col date"></div>
            </div>
            <div class="col icon" :style="{marginLeft: count + 'em'}">
                <span @click="toggleExtract" v-if="isDirectory" class="openLink">
                    <i class="fa" :class="extracted ? 'fa-folder-open' : 'fa-folder' "></i>
                </span>
                <span v-else  class="openLink" @click="jumpTo">
                    <i :class="iconClass"></i>                
                </span>
            </div>
            <div class="col name" :style="{width: 'calc(50% - 40px - ' + count +'em)'}">
                <a :href="url" @click="jumpTo" class="fileLink">{{ name }}</a>
            </div>
            <div class="col size">{{humanSize}}</div>
            <div class="col date">{{date | moment("from")}}</div>
            <div class="col name" v-show="childrenLoading" :style="{width: 'calc(100% - ' + (count + 1) +'em)', marginLeft: (count + 1) + 'em'}">
                Loading......
            </div>
            <node v-for="child in searchedSortedChildren" :key="url + child.name" :sort="sort" :folder="child" :path="url" :count="count + 1"/>
        </div>
        
`,
    data: function() {
        return {
            children: [],
            childrenLoading: false,
            searchText: ''
        }
    },
    mounted: function() {
        if (this.root) {
            this.extract();
        }
    },
    props: {
        'folder': Object,
        'sort': Object,
        'root': null,
        'path': {type: String, default: "/"},
        'count': {type: Number, default: 0}
    },
    computed: {
        name: function() {
            return this.folder.name;
        },
        iconClass: function(){
            if(this.isDirectory){
                return 'fa fa-folder'
            }
            let filename = this.name;
            let index = filename.lastIndexOf(".");
            if (index === -1) {
                return 'fa fa-file'
            }
            let suffix = filename.substr(index+1);
            let wordFile = ['doc', 'docx'];
            let powerpointFile = ['ppt', 'pptx'];
            let excelFile = ['xls'];
            let videoFile = ['mp4', 'avi', '3gp', 'mkv', 'rmvb', 'wmv', 'swf'];
            let audioFile = ['mp3', 'wma', 'wav', 'ogg', 'flac', 'm3u'];
            let archiveFile = ['7z', 'zip', 'rar', 'tar', 'gz'];
            let mirrorFile = ['img', 'iso', 'dmg'];
            let photoFile = ['psd', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico'];
            let javaFile = ['java', 'jar', 'class'];
            let jsFile = ['js'];
            let phpFile = ['php'];
            let otherCodingFile = ['json', 'go', 'conf', 'sh', 'sql', 'py', 'h', 'c', 'cpp', 'bat', 'cmd', 'css', 'html', 'md', 'rb', 'xml'];
            let pdfFile = ['pdf'];
            let textFile = ['txt', 'rtf'];
            let csvFile = ['csv'];


            if (in_array(suffix, wordFile)) {
                return 'fa fa-file-word'
            }else if (in_array(suffix, powerpointFile)) {
                return 'fa fa-file-powerpoint'
            }else if (in_array(suffix, excelFile)) {
                return 'fa fa-file-excel'
            }else if (in_array(suffix, videoFile)) {
                return 'fa fa-file-video'
            }else if (in_array(suffix, audioFile)) {
                return 'fa fa-file-audio'
            }else if (in_array(suffix, archiveFile)) {
                return 'fa fa-file-archive'
            }else if (in_array(suffix, mirrorFile)) {
                return 'fa fa-compact-disc'
            }else if (in_array(suffix, photoFile)) {
                return 'fa fa-file-image'
            }else if (in_array(suffix, javaFile)) {
                return 'fab fa-java'
            }else if (in_array(suffix, jsFile)) {
                return 'fab fa-node-js'
            }else if (in_array(suffix, phpFile)) {
                return 'fab fa-php'
            }else if (in_array(suffix, otherCodingFile)) {
                return 'fa fa-file-code'
            }else if (in_array(suffix, pdfFile)) {
                return 'fa fa-file-pdf'
            }else if (in_array(suffix, textFile)) {
                return 'fa fa-file-alt'
            }else if (in_array(suffix, csvFile)) {
                return 'fa fa-file-csv'
            }else {
                return 'fa fa-file'
            }
        },
        isDirectory: function() {
            return (this.folder.type || 'directory') === 'directory';
        },
        date: function() {
            // TODO: Optimize. Parsing with format is very costly. So using `new Date`, but still costly and its behaviour across browsers isn't stable.
            // return moment(this.folder.mtime, 'ddd, DD MMM YYYY HH:mm:ss Z'); //"Tue, 20 Dec 2016 13:10:20 GMT"
            return new Date(this.folder.mtime);
        },
        size: function() {
            return this.folder.size;
        },
        humanSize: function() {
            return this.size ? Humanize.fileSize(this.size) : null;
        },
        url: function() {
            return PathJoiner(this.path, this.name, this.isDirectory);
        },
        extracted: function() {
            return !!(this.children && this.children.length > 0);
        },
        searchedSortedChildren: function() {
            var c;
            var s = this.searchText.trim();
            if (s.length > 1) {
                c = this.children.filter(function(i) {
                    //TODO: Truly fuzzy search. implement complex regex? :P
                    return i.name.match(new RegExp(s,'i')) != null;
                });
            } else {
                c = this.children.slice(0);
            }
            var sort = this.sort;
            if (sort.by) {
                c.sort(function(a,b) {
                    var x,y;
                    if (sort.by == 'name') {
                        x = a.name.toLowerCase();
                        y = b.name.toLowerCase();
                    } else if (sort.by == 'size') {
                        x = a.size;
                        y = b.size;
                    } else if (sort.by == 'date') {
                        //TODO: mtime is string. sort by date unix value,
                        //but don't want to convert it twice (inside component).
                        x = new Date(a.mtime);
                        y = new Date(b.mtime);
                    }
                    return (sort.asc ? (x > y) : (x < y)) ? 1 : -1;
                });
            }
            return c;
        }
    },
    beforeUpdate: function() {
        console.time(this.url);
    },
    updated: function() {
        console.timeEnd(this.url);
    },
    methods: {
        toggleExtract: function() {
            if (this.extracted) {
                this.children = [];
            } else {
                this.extract();
            }
        },
        extract: function() {
            if (!this.name || !this.isDirectory) {
                return;
            }
            var vm = this;
            vm.childrenLoading = true;
            axios.get(this.url + '?path')
            .then(function(response) {
                vm.childrenLoading = false;
                vm.children = response.data;
            })
            .catch(function (error) {
              alert(error);
            });;
        },
        jumpTo: function($e) {
            if (this.isDirectory) {
                $e.preventDefault();
                RootNode.goTo(this.path, this.name);
            }
        }
    },
    watch: {
        url: function() {
            this.children = [];
            if (this.root) {
                this.extract();
            }
        }
    }
});

Vue.component('breadcrumb', {
    template: `
                
                    <ol class="breadcrumb" style="margin-bottom: 0; background-color:#4f9bff">
                        <li class="breadcrumb-item" v-for="dir in dirs"><a @click="jumpTo(dir)" style="color: #fff">{{dir.name}}</a></li>
                    </ol>
                
       `,
    computed: {
        dirs: function() {
            var $paths = this.path == "/" ? [] : this.path.split("/").slice(1, this.path.endsWith('/') ? -1 : undefined);
            if (this.name != "/") {
                $paths.push(this.name);
            }
            $paths.unshift("/");
            var walkedPath = "";
            $paths = $paths.map(function(i) {
                var _path = walkedPath;
                walkedPath = PathJoiner(_path, decodeURIComponent(i), true);
                return {
                    name: decodeURIComponent(i),
                    path: _path
                }
            });
            return $paths;
        }
    },
    methods: {
        jumpTo: function(dir) {
            RootNode.goTo(dir.path, dir.name);
        }
    },
    props: ['path', 'name']
});

var RootNode = new Vue({
    name: 'RootNode',
    el: "#app",
    template: `
            <div>

            <div class="row" style="margin: 10px">
                <div class="col-12">
                    <breadcrumb :path="basePath" :name="folder.name"/>
                </div>
                <div class="col-12" style="margin-top: 10px;">
                    <node-sort @input="sort = arguments[0]"/>

                    <node root="true" :sort="sort" :folder="folder" :path="basePath"/>
                    
                    <div class="col name full" style="border-radius: 0 0 0 5px; background-color: #e8e8e8; border-bottom: 1px #a3a3a3 solid;">名字</div>
                    <div class="col size " style="background-color: #e8e8e8; border-bottom: 1px #a3a3a3 solid;">大小</div>
                    <div class="col date " style="border-radius: 0 0 5px 0; background-color: #e8e8e8; border-bottom: 1px #a3a3a3 solid;">日期</div>
                </div>
            </div>
            </div>
      `,
    created: function() {
        var vm = this;
        vm.setDocTitle();
        window.addEventListener('popstate', function() {
            var $ls = vm.getLocationState();
            vm.goTo($ls.path, $ls.name, true);
        });
    },
    methods: {
        setDocTitle: function() {
            document.title = decodeURIComponent(PathJoiner(this.basePath, this.folder.name));
        },
        goTo: function(path, name, ignorePushState) {
            this.folder.name = name;
            this.basePath = path;
            ignorePushState || history.pushState(null, null, PathJoiner(path, name, true));
            this.setDocTitle();
        },
        getLocationState: function() {
            var $location = location.pathname;
            if ($location == "/") {
                return {
                    name: "/",
                    path: "/"
                }
            } else {
                var $dirs = $location.split("/");
                $dirs.pop();
                var $name = decodeURIComponent($dirs.pop());

                return {
                    name: $name,
                    path: $dirs.join("/")
                }
            }
        }
    },
    data: function() {
        var $ls = this.getLocationState();
        return {
            folder: {name: $ls.name},
            basePath: $ls.path,
            sort: {}
        }
    }
})
