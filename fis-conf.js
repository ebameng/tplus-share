
fis.config.init({
    project : {
        charset : 'utf8',
        md5Length : 8,
        md5Connector: '-',
        include : /^\/(static|index.html)/
    }
});

fis.config.set('roadmap', {
	path: [
	{
		reg: /\.\/static\/.*/i,  //如果有这个文件就做替换，没有就不做替换，暂且认为fis是扫描项目的全部文件再又难过正则去匹配之
		useHash: true,
		release: '$&', //当资源被匹配后release了，它会去 include 的目录下寻找所有的引用，并替换旧的引用为md5后的形式

		useDomain: true, //让引用匹配文件的某个文件中的src || href 带md5前缀 fis -o --domains -d output 才行
		url: '$&' //这里的uri是不会带host的
	}],
	
	domain: "http://tplusshare.qiniudn.com",
	useCache: false 
});

// fis release -om -d output -D
//1. fis规定了某类资源被引用时的引用具体URL
