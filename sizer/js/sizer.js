var buildDom=new function(container){
	var me=this;
	me.container=container || $("[class='container']");
	return {
		colWidthBS:function(blockItem,device){
			var classList=$(blockItem)[0].classList;
			var found=false;
			var deviceBS={xs:'xs',sm:'sm',md:'md',lg:'lg'};
			var colDevice=deviceBS[device] || 'sm';

			colDevice='col-'+colDevice;
			for (var iClass=0 ; iClass<classList.length && !found; iClass++){found=iClass*(classList[iClass].slice(0,colDevice.length)===colDevice);}
			if (found)return classList[found];
			return null;
 		},
		rowCount:function(container){return $(me.container || container).children().length;},
		row:function(container){
			var row=document.createElement('div');
			row.classList.add("ui-resizable","row");
			row.attributes["data-row"]=buildDom.rowCount(container)+1;
			$(row).attr("data-row",row.attributes["data-row"]);
			return row;
		},
		colCount:function(row){return $(row).find('[class*="col-sm-"]').length;},
		col:function(row,gridCols){
			row=$(row)[0];
			var col=document.createElement('div');
			var colCount=buildDom.colCount(row)+1;
			col.classList.add("ui-resizable","col-sm-"+gridCols);
			col.attributes["data-cell"]=row.attributes["data-row"]+'.'+colCount;
			$(col).attr("data-cell",col.attributes["data-cell"]);
			col.innerHTML="Row "+row.attributes["data-row"]+"<br>Col "+colCount;
			return col;
		}
	}
}

var gridMenuMgr={
	hide:function(){
		$("#mnu-grid-mgr").removeClass('show');
		$("#mnu-grid-mgr")[0].style='';
	},
	show:function(x,y){
		$("#mnu-grid-mgr").css({left:x,top:y});
		$("#mnu-grid-mgr").toggleClass('show');
		$("#mnu-grid-mgr").on("click",gridMenuMgr.hide);
	},
	menuselectEvent:function(event,ui){
		switch (ui.item.attr('id')){
			case "row-ins-b","row-ins-a":
				var row=buildDom.row().appendChild(buildDom.col());
				break;
			case '':
			break;

			case "row-del":
			break;

			case "col-div":
				var selectedItem=gridSizerMrg.selectedItem();
				var row=$('[data-row="'+selectedItem.row+'"]');
				var col=$('[data-cell="'+gridSizerMrg.datacell+'"]');
				var colWidthBS=buildDom.colWidthBS(col,'sm').split('-')[2];
				var colNewWidthBS=[Math.floor(colWidthBS/2),colWidthBS-Math.floor(colWidthBS/2)];
				var newCol=buildDom.col(row,colNewWidthBS[0]);
				row.prepend(newCol);
				gridSizerMrg.setResizable.Col(newCol);
				gridSizerMrg.updClass(col,colNewWidthBS[1]);
				break;

			case "col-del":
				break;
		}
	},
	init:function(){
		$("#mnu-grid-mgr").menu();
		$( "#mnu-grid-mgr" ).on("menuselect",function(event,ui){gridMenuMgr.menuselectEvent(event,ui);});
	}
};

var gridSizerMrg={
	selectedItem:function(datacell){
		this.datacell=datacell || this.datacell;
		return {row:this.datacell.split('.')[0],
				col:this.datacell.split('.')[1]};
	},
	onResize:false,
	updClass:function(blockItem,col){
		var classItem=buildDom.colWidthBS(blockItem,'sm')
		if (classItem){
			$(blockItem)[0].classList.remove(classItem);
			$(blockItem)[0].classList.add("col-sm-"+col);
		}
		$(blockItem)[0].style.width=""
	},
	resizeEvent:function(event,ui){
		gridMenuMgr.hide();

		var block=ui.element[0];
		if (!block.classList.contains("row")){
			var col=Math.round(12/(block.parentElement.offsetWidth/block.offsetWidth))
			gridSizerMrg.updClass(block,col);
			block=block.nextElementSibling || block.previousElementSibling;
			gridSizerMrg.updClass(block,12-col);
		}
	},
	resizestartEvent:function(event,ui){
		event.stopPropagation();
		gridSizerMrg.onResize=!(event.currentTarget.classList.contains('row'));
	},
	clickEvent:function(event){
		event.stopPropagation();
		if (!gridSizerMrg.onResize){
			gridSizerMrg.selectedItem(event.currentTarget.attributes['data-cell']);
			gridMenuMgr.show(event.clientX,event.clientY);
		}
		gridSizerMrg.onResize=false;
	},
	setResizable:{
		Col:function(col){
			$(col).resizable({grid:[col.parentElement.offsetWidth/12,10],
				  			   maxWidth:col.parentElement.offsetWidth/12*11,
				  			   handles:"e"});
		},
	    Row:function(row){
	    	var cols=row.children;
	    	for (iCol=0 ; iCol<cols.length-1 ; iCol++){gridSizerMrg.setResizable.Col(cols[iCol]);}
	    	$(row).resizable({handles:"n,s"});
	    }
	},
	init:function(){
		$(".ui-resizable.row").each(function(index, row){gridSizerMrg.setResizable.Row(row);});
		$(".ui-resizable").on("resizestart",function(event,ui){gridSizerMrg.resizestartEvent(event,ui);});
		$(".ui-resizable").on("resize",		function(event,ui){gridSizerMrg.resizeEvent(event,ui);});
		$(".ui-resizable").on("resizestop",	function(event,ui){});
		$(".ui-resizable").on("click",		function(event){gridSizerMrg.clickEvent(event);});
	}
};

$(function() {
	var row=buildDom.row();
	row.appendChild(buildDom.col(row,6));
	row.appendChild(buildDom.col(row,6));
	$("[class='container']")[0].appendChild(row);

	gridSizerMrg.init();
	gridMenuMgr.init();
})