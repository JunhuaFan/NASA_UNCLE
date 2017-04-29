using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace nasauncle.Models.Service
{
    public class ResourceService
    {

        /* 1.上傳檔案
         * 2.抓出資料/刪除檔案
         * 3.匯入資料到sql server
         * 
         * 
         * 
         * */
        public string import(HttpPostedFileBase fileuploadExcel, HttpServerUtilityBase Server)
        {

            //上傳檔案
            string filename = "";
            string fullFilename = "";
            if (fileuploadExcel != null && fileuploadExcel.ContentLength > 0)
            {
                filename = Path.GetFileName(fileuploadExcel.FileName);
                string picExten = System.IO.Path.GetExtension(filename);
                filename = DateTime.Now.ToString("yyyyMMddhhmmss") + picExten;
                fullFilename = Path.Combine(Server.MapPath("~/Content/uploads"), filename);
                fileuploadExcel.SaveAs(fullFilename);
            }



            //抓出Excel資料 
            var sData = new LinqToExcel.ExcelQueryFactory(fullFilename);
            var rows = (from row in sData.Worksheet("Sheet1") select row).ToList();

            DataTable dt = new DataTable();
                   // sa  cerrentX cerrentY    waveh tide    uv




            dt.Columns.Add("DateX");
            dt.Columns.Add("dat");
            dt.Columns.Add("lonX");
            dt.Columns.Add("chll");
            dt.Columns.Add("codeb");
            foreach (var item in rows)
            {
                DataRow dr = dt.NewRow();
                dr["codea"] = item[0];
                dr["codeb"] = item[1];
                dt.Rows.Add(dr);
            }



            //匯入資料到暫存table
            string BStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
            try
            {
                SqlConnection Bulkcn = new SqlConnection(BStr);//SqlBulkCopy裡面就只能放SqlConnection，不能放別的像是OleDbConnection

                SqlBulkCopy SBC = new SqlBulkCopy(Bulkcn);

                //複製到目的地的哪個資料表
                SBC.DestinationTableName = "codeTmp";

                //設定你要複製過去的DataTable的每個欄位要對應到目的地的哪個欄位
                //SBC.ColumnMappings.Add("DataTable的欄位A", "資料庫裡的資料表的的欄位A");
                SBC.ColumnMappings.Add("codea", "codea");
                SBC.ColumnMappings.Add("codeb", "codeb");

                Bulkcn.Open();

                //假設DT1是已經有資料的DataTable，直接放進去就可以開始寫入了
                SBC.WriteToServer(dt);
                SBC.Close();
                Bulkcn.Close();

            }
            catch (Exception ex)
            {
                return "資料上傳異常1" + ex.Message;
            }



            ////從暫存table轉資料到正式資料表，會過濾重覆的資料
            //CodeDao dao = new CodeDao();
            //string transresult = dao.transData();
            //if (!transresult.Equals("OK"))
            //{
            //    return "資料上傳異常2";
            //}


            ////刪除匯入的資料
            //dao.clearnTmpData();



            return "上傳完成";
        }


    }
}