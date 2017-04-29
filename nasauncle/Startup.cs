using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(nasauncle.Startup))]
namespace nasauncle
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
