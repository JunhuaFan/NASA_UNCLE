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
            using (nasauncleEntities db = new nasauncleEntities())
            {

            }


                return View();
        }

         
        [HttpPost]
        public ActionResult importExcel(HttpPostedFileBase file1)
        {

            if (file1 == null || file1.ContentLength == 0)
            {
                return RedirectToAction("import", new { msg = "無檔案" });
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


            return RedirectToAction("importData", new { msg = addMsg });
        }






        //將sheet 轉成datatable
        private DataTable genData(ISheet sheet)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("rName");
            dt.Columns.Add("rAddress");
            dt.Columns.Add("rPhone1");
            dt.Columns.Add("rPhone2");
            //dt.Columns.Add("rSalesName"); 

            bool isBeginRow = false;//從那一筆開始要讀資料


            for (int row = 0; row <= sheet.LastRowNum; row++)
            {


                if (sheet.GetRow(row) != null) //null is when the row only contains empty cells 
                {
                    int cIndex = 0;//第幾個欄位
                    String value1 = "";
                    String value2 = "";
                    String value3 = "";
                    String value4 = "";
                    //String value5 = "";


                    //foreach (var c in sheet.GetRow(row).Cells)
                    //{
                    for (int i = 0; i < 5; i++)
                    {
                        var c = sheet.GetRow(row).GetCell(i);

                        cIndex++;
                        string value = "";

                        //如果Null就帶空字串
                        if (c != null)
                        {
                            //如果是數字型 就要取 NumericCellValue  這屬性的值
                            if (c.CellType == CellType.Numeric)
                                value = c.NumericCellValue.ToString("#");

                            //如果是字串型 就要取 StringCellValue  這屬性的值
                            if (c.CellType == CellType.String)
                                value = c.StringCellValue;

                        }
                        //是否開始讀資料了，若還沒 都真接跳下一圈
                        if (!isBeginRow)
                        {
                            if (value.Equals("姓名"))
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
                            value1 = value;
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
                        //else if (cIndex == 5)
                        //{
                        //    value5 = value;
                        //}
                        //value += ",";

                    }

                    //有姓名才表示有效記錄 
                    if (value1 != null && value1.Length > 0)
                    {
                        DataRow drow = dt.NewRow();
                        drow["rName"] = value1;
                        drow["rPhone1"] = value2;
                        drow["rPhone2"] = value3;
                        drow["rAddress"] = value4;
                        //drow["rSalesName"] = value5; 
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
                    //callCenterMember s = new callCenterMember();
                    //s.rName = data.Rows[i]["rName"].ToString();
                    //s.rAddress = data.Rows[i]["rAddress"].ToString();
                    //s.rPhone1 = data.Rows[i]["rPhone1"].ToString().Replace("'", "");
                    //s.rPhone2 = data.Rows[i]["rPhone2"].ToString();
                    //s.rSalesName = "";// data.Rows[i]["rSalesName"].ToString().Replace("'", "");
                    //s.currentCallUser = "";
                    //s.createDate = DateTime.Now;
                    //s.lastCallDate = new DateTime(1900, 1, 1);
                    //s.isDel = "N";

                    //db.callCenterMembers.Add(s);
                    //db.SaveChanges();

                }
            }

            addMsg = "匯入完成";
            return result;
        }


    }
}