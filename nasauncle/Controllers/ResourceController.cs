using nasauncle.Models;
using nasauncle.Models.Service;
using System;
using System.Collections.Generic;
using System.Linq;
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
        public ActionResult importExcel(HttpPostedFileBase fileuploadExcel)
        { 

            //匯入資料
            ResourceService service = new ResourceService();
            string result = service.import(fileuploadExcel, Server);

            @ViewBag.msg = result;

            return View();
        }


    }
}