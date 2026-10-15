/* Default Store categories (seeded until the owner saves their own in Admin > Store categories).
   A category appears as a Store tab when tab:true. Fields show only when a product has a value for them. */
window.HX_STORE_DEFAULT={cats:[
 {id:'animations',name:'Animations',tab:true,order:1,requireVideo:true,fields:[
  {k:'type',label:'Type',type:'select',opts:['Object','UI','Text','Scene','Collection'],filter:true,page:true},
  {k:'premiere',label:'Premiere Pro',type:'text',card:true,cardLabel:'Premiere',page:true},
  {k:'res',label:'Resolution',type:'select',opts:['1080p','1440p','4K'],filter:true,page:true},
  {k:'fps',label:'Frame rate',type:'select',opts:['24','30','60'],filter:true,page:true},
  {k:'duration',label:'Duration',type:'text',page:true},
  {k:'size',label:'File size',type:'text',page:true},
  {k:'params',label:'Editable parameters (Essential Graphics)',type:'longtext',page:true},
  {k:'requires',label:'Required fonts, effects and plugins',type:'longtext',page:true},
  {k:'install',label:'Install steps',type:'longtext',page:true}]},
 {id:'builds',name:'Builds',tab:true,order:2,fields:[
  {k:'type',label:'Type',type:'select',opts:['Map','Structure','World','Spawn','Arena'],filter:true,page:true},
  {k:'theme',label:'Theme',type:'select',opts:['Medieval','Modern','Fantasy','Sci-fi','Survival','Other'],filter:true,page:true},
  {k:'edition',label:'Edition',type:'select',opts:['Java','Bedrock','Java + Bedrock'],filter:true,card:true,cardLabel:'',page:true},
  {k:'mcver',label:'Minecraft version',type:'text',card:true,cardLabel:'Minecraft',page:true},
  {k:'size',label:'Dimensions',type:'text',page:true},
  {k:'format',label:'File format',type:'text',page:true},
  {k:'import',label:'Import steps',type:'longtext',page:true},
  {k:'packs',label:'Required packs, datapacks or mods',type:'longtext',page:true}]},
 {id:'plugins',name:'Plugins',tab:true,order:3,fields:[
  {k:'type',label:'Type',type:'select',opts:['Plugin','Mod'],filter:true,page:true},
  {k:'software',label:'Server software or loader',type:'select',opts:['Paper','Spigot','Purpur','Bukkit','Fabric','Forge','NeoForge'],filter:true,card:true,cardLabel:'',page:true},
  {k:'versions',label:'Supported versions',type:'text',filter:true,card:true,cardLabel:'MC',page:true},
  {k:'deps',label:'Dependencies',type:'text',page:true},
  {k:'cmds',label:'Commands, permissions and config',type:'longtext',page:true},
  {k:'install',label:'Install and update steps',type:'longtext',page:true},
  {k:'changelog',label:'Changelog',type:'longtext',page:true},
  {k:'supportchan',label:'Support channel',type:'text',page:true}]}]};
