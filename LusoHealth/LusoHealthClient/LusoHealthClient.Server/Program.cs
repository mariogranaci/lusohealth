using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using LusoHealthClient.Server.Services;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<JWTService>();

builder.Services.AddIdentityCore<User>(options =>
{
    //configurações email
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;

    //para confirmar email
    options.SignIn.RequireConfirmedEmail = true;
})
    .AddRoles<IdentityRole>() //para adicionar roles
    .AddRoleManager<RoleManager<IdentityRole>>() //usar o RoleManager
    .AddEntityFrameworkStores<ApplicationDbContext>() //usar o nosso context
    .AddSignInManager<SignInManager<User>>() //usar o SignInManager
    .AddUserManager<UserManager<User>>() //usar o UserManager
    .AddDefaultTokenProviders(); //Usado para criar os tokens de confirmação de email

//Permite fazer a autenticação usando os JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            //validar o token baseado na key dada no development.json JWT:Key
            ValidateIssuerSigningKey = true,
            //o issuer signing key baseada na JWT:Key
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
            //o issuer é o link do projeto api 
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidateIssuer = true,
            ValidateAudience = false,
        };
    });

builder.Services.AddCors();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = actionContext =>
    {
        var errors = actionContext.ModelState
            .Where(e => e.Value.Errors.Count > 0)
            .SelectMany(kvp => kvp.Value.Errors.Select(error => new
            {
                Message = error.ErrorMessage,
                Field = kvp.Key
            }))
            .ToArray();

        var toReturn = new
        {
            Errors = errors
        };

        return new BadRequestObjectResult(toReturn);
    };

});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowAllOrigins");

//app.UseCors("AllowAllOrigins");

//app.Use(async (context, next) =>
//{
//    if (context.Request.Method == "OPTIONS")
//    {
//        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
//        context.Response.Headers.Add("Access-Control-Allow-Headers", "*");
//        context.Response.Headers.Add("Access-Control-Allow-Methods", "*");
//        context.Response.StatusCode = 200;
//    }
//    else
//    {
//        await next();
//    }
//});

//app.UseCors(options =>
//{
//    options.AllowAnyHeader()
//           .AllowAnyMethod()
//           .AllowCredentials()
//           .WithOrigins("http://localhost:4200");
//});




// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
