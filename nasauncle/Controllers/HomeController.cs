using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace nasauncle.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Index2()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Earth()
        {
            return View();
        }

        public ActionResult TW()
        {
            return View();
        }

        public String getDangerData() {

            return 
            "[" +
                "{\"Latitude\":123.456, \"Longitude\":123.456, \"good\":[\"釣魚\",\"游泳\"], \"bad\":[\"\"], \"UV\":1 }," +
                "{\"Latitude\":123.456, \"Longitude\":123.456, \"good\":[\"釣魚\"], \"bad\":[\"游泳\"], \"UV\":2}"+
            "]";
        }
    }
}