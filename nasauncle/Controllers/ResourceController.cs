using nasauncle.Models;
using nasauncle.Models.Service;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace nasauncle.Controllers
{
    public class ResourceController : Controller
    {
        // GET: Resource
        public ActionResult Index()
        {
            return View();
        }



        // 匯入excel檔資料
        public ActionResult importExcel()
        {


                return View();
        }

         
        [HttpPost]
        public ActionResult importExcel(HttpPostedFileBase file1)
        {

            if (file1 == null || file1.ContentLength == 0)
            {
                return RedirectToAction("importExcel", new { msg = "無檔案" });
            }

            //上傳檔案
            string filename = "";
            string fullPath = "";
            filename = Path.GetFileName(file1.FileName);
            string picExten = System.IO.Path.GetExtension(filename);
            filename = DateTime.Now.ToString("yyyyMMddhhmmss") + "_a" + picExten;
            fullPath = Path.Combine(Server.MapPath("~/Content/uploads"), filename);
            file1.SaveAs(fullPath);

            //讀出資料  & 寫入資料庫

            XSSFWorkbook workbook;
            //讀取專案內中的sample.xls 的excel 檔案
            using (FileStream file = new FileStream(fullPath, FileMode.Open, FileAccess.Read))
            {
                workbook = new XSSFWorkbook(file);
            }

            nasauncleEntities db = new nasauncleEntities();


            //讀取Sheet1 工作表
            ISheet sheet = workbook.GetSheet("Sheet1");


            //準備資料
            String currentCallUser = User.Identity.Name;
            DateTime now = DateTime.Now;


            //將資料打包轉成dataTable
            DataTable dt = genData(sheet);
             
            //寫入db
            bool result = addData(dt, now);


            return RedirectToAction("importExcel", new { msg = addMsg });
        }






        //將sheet 轉成datatable
        private DataTable genData(ISheet sheet)
        {


            DataTable dt = new DataTable();
            dt.Columns.Add("DateX");
            dt.Columns.Add("dat");
            dt.Columns.Add("lonX");
            dt.Columns.Add("chll");
            dt.Columns.Add("sst");
            dt.Columns.Add("sa");
            dt.Columns.Add("cerrentX");
            dt.Columns.Add("cerrentY");
            dt.Columns.Add("waveh");
            dt.Columns.Add("tide");
            dt.Columns.Add("uv"); 

            bool isBeginRow = false;//從那一筆開始要讀資料


            for (int row = 0; row <= sheet.LastRowNum; row++)
            {


                if (sheet.GetRow(row) != null) //null is when the row only contains empty cells 
                {
                    int cIndex = 0;//第幾個欄位
                    DateTime value1 = new DateTime();
                    string value2 = "";
                    string value3 = "";
                    string value4 = "";
                    string value5 = "";
                    string value6 = "";
                    string value7 = "";
                    string value8 = "";
                    string value9 = "";
                    string value10 = "";
                    string value11 = ""; 


                    //foreach (var c in sheet.GetRow(row).Cells)
                    //{
                    for (int i = 0; i < 11; i++)
                    {
                        var c = sheet.GetRow(row).GetCell(i);

                        cIndex++;
                        string value = "";

                        //如果Null就帶空字串
                        if (c != null)
                        {
                            //如果是數字型 就要取 NumericCellValue  這屬性的值
                            if (c.CellType == CellType.Numeric)
                                value = c.NumericCellValue.ToString("#.##########");

                            //如果是字串型 就要取 StringCellValue  這屬性的值
                            if (c.CellType == CellType.String)
                                value = c.StringCellValue;
                             

                        }
                        //是否開始讀資料了，若還沒 都真接跳下一圈
                        if (!isBeginRow)
                        {
                            if (value.Equals("DateX"))
                            {
                                //讀到標題列 ，下一筆就要開始讀資料
                                isBeginRow = true;
                                break;
                            }
                            else
                            {
                                break;
                            }
                        }

                        if (cIndex == 1)
                        {
                            value1 = Convert.ToDateTime( value );
                        }
                        else if (cIndex == 2)
                        {
                            value2 = value;
                        }
                        else if (cIndex == 3)
                        {
                            value3 = value;
                        }
                        else if (cIndex == 4)
                        {
                            value4 = value;
                        }
                        else if (cIndex == 5)
                        {
                            value5 = value;
                        }
                        else if (cIndex == 6)
                        {
                            value6 = value;
                        }
                        else if (cIndex == 7)
                        {
                            value7 = value;
                        }
                        else if (cIndex == 8)
                        {
                            value8 = value;
                        }
                        else if (cIndex == 9)
                        {
                            value9 = value;
                        }
                        else if (cIndex == 10)
                        {
                            value10 = value;
                        }
                        else if (cIndex == 11)
                        {
                            value11 = value;
                        }

                    }

                    //有姓名才表示有效記錄 
                    if (value2  !=null && value2.Length>0)
                    {
                         
                        DataRow drow = dt.NewRow();
                        drow["DateX"] = value1;
                        drow["dat"] = value2;
                        drow["lonX"] = value3;
                        drow["chll"] = value4;
                        drow["sst"] = value5;
                        drow["sa"] = value6;
                        drow["cerrentX"] = value7;
                        drow["cerrentY"] = value8;
                        drow["waveh"] = value9;
                        drow["tide"] = value10;
                        drow["uv"] = value11;
                        dt.Rows.Add(drow);

                    }

                }

            }


            return dt;


        }

        string addMsg = "";

        //新增資料
        private bool addData(DataTable data, DateTime now)
        {
            bool result = true;
            if (data.Rows.Count == 0)
            {
                result = false;
                addMsg = "匯入資料異常，無資料";
                return result;
            }

            using (nasauncleEntities db = new nasauncleEntities())
            {

                for (int i = 0; i < data.Rows.Count; i++)
                {
                    SeaData sd = new SeaData();
                    sd.DateX = Convert.ToDateTime(data.Rows[i]["DateX"]);
                    try
                    {
                        sd.dat = Convert.ToDecimal(data.Rows[i]["dat"]);
                    }
                    catch
                    {
                        sd.dat = 0;
                    }
                    try
                    {
                        sd.lonX = Convert.ToDecimal(data.Rows[i]["lonX"]);
                    }
                    catch
                    {
                        sd.lonX = 0;
                    }
                    try
                    {
                        sd.chll = Convert.ToDecimal(data.Rows[i]["chll"]);
                    }
                    catch
                    {
                        sd.chll = 0;
                    }
                    try
                    {
                        sd.sst = Convert.ToDecimal(data.Rows[i]["sst"]);
                    }
                    catch
                    {
                        sd.sst = 0;
                    }
                    try
                    {
                        sd.sa = Convert.ToDecimal(data.Rows[i]["sa"]);
                    }
                    catch
                    {
                        sd.sa = 0;
                    }
                    try
                    {
                        sd.cerrentX = Convert.ToDecimal(data.Rows[i]["cerrentX"]);
                    }
                    catch
                    {
                        sd.cerrentX = 0;
                    }
                    try
                    {
                        sd.cerrentY = Convert.ToDecimal(data.Rows[i]["cerrentY"]);
                    }
                    catch
                    {
                        sd.cerrentY = 0;
                    }
                    try
                    {
                        sd.waveh = Convert.ToDecimal(data.Rows[i]["waveh"]);
                    }
                    catch
                    {
                        sd.waveh = 0;
                    }
                    try
                    {
                        sd.tide = Convert.ToDecimal(data.Rows[i]["tide"]);
                    }
                    catch
                    {
                        sd.tide = 0;
                    }
                    try
                    {
                        sd.uv = Convert.ToDecimal(data.Rows[i]["uv"]);
                    }
                    catch
                    {
                        sd.uv = 0;
                    }

                    db.SeaDatas.Add(sd);
                    db.SaveChanges();

                }


            }

            addMsg = "匯入完成";
            return result;
        }




        public ActionResult getData()
        {

            Response.AppendHeader("Access-Control-Allow-Origin", "*");

            using (nasauncleEntities db = new nasauncleEntities())
            {
                var data = (from s in db.SeaDatas  select s);

                var result = data.ToList(); 

                StringBuilder sb = new StringBuilder();

                sb.Append("[");
                int tmpI = 0;

                foreach(var item in result)
                {
                    if(tmpI>0)
                    {
                        sb.Append(",");

                    }

                    sb.Append("     {");

                    sb.Append("             \"Latitude\":"+ Convert.ToDouble( item.dat )+" ,");
                    sb.Append("             \"Longitude\":" + Convert.ToDouble(item.lonX)  + " ,");

                    String goodStr = "";
                    String badStr = "";

                    if(item.sst>=25 && item.chll>=5)
                    {
                        badStr = "禁止親水活動,不適釣魚";
                    }else  if (item.sst >= 25 && item.chll >= 5)
                    { 
                        badStr += "親水活動";

                        goodStr += "可以釣魚活動";
                    }else if (item.sst >= 20 && item.sst < 25 && item.chll >= 5)
                    {
                        badStr = "親水活動";
                        goodStr = "可以釣魚活動";
                    }else if (item.sst >= 20 && item.sst < 25 && item.chll >= 5)
                    {
                        badStr = "親水活動";
                        goodStr = "可以釣魚活動";
                    }else if (item.sst >= 20 && item.sst < 25 && item.chll >= 1 && item.chll<5)
                    {
                        badStr = "嬰幼兒及老人親水活動";
                        goodStr = "可以釣魚活動";
                    }else if (item.sst >= 20 && item.sst < 25 && item.chll <1)
                    {

                        badStr = "嬰幼兒及老人親水活動";
                        goodStr = "可以釣魚活動";
                    }else
                    {
                        badStr = "嬰幼兒及老人親水活動";
                        goodStr = "可以釣魚活動";
                    }



                    sb.Append("             \"good\":[\"" + goodStr + "\"] ,");
                    sb.Append("             \"bad\":[\"" + badStr  + "\"] ,");
                    sb.Append("             \"UV\":");

                    if(item.uv<3)
                    {
                        sb.Append("1");
                    }
                    else if (item.uv >= 3 && item.uv <6 )
                    {
                        sb.Append("2");
                    }
                    else if (item.uv >= 6 && item.uv <8)
                    {
                        sb.Append("3");
                    }
                    else if (item.uv >= 8 && item.uv <11)
                    {
                        sb.Append("4");
                    }
                    else if (item.uv >= 11 )
                    {
                        sb.Append("5");
                    }


                        sb.Append("     }");
                    tmpI++;
                }

                //{ "Latitude":123.456, "Longitude":123.456, "good":["釣魚","游泳"], "bad":[""], "UV":1 },
                //{"Latitude":123.456, "Longitude":123.456, "good":["釣魚"], "bad":["游泳"], "UV":2}


                sb.Append("]");





                return Content(sb.ToString());
            }
        }







    }
}