import * as utils from '@dcl/ecs-scene-utils'


function create_display(link: string){
    myVideoClip = new VideoClip(link)

    myVideoTexture = new VideoTexture(myVideoClip)
    myVideoTexture.loop = true

    myMaterial.albedoTexture = myVideoTexture 
}


async function get_data(minute: number) {
    // let json = await utils.sendRequest(
    //     'https://worldtimeapi.org/api/timezone/etc/gmt+3'
    // )
    // let toDate = new Date(json.datetime)
    // log(toDate)
    // log(toDate.getSeconds())
    
    var link: string
    if (minute % 2 == 0){
        link = "https://vod-progressive.akamaized.net/exp=1643990950~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F3195%2F19%2F490977203%2F2205504628.mp4~hmac=afae8c846327abae24598fc136025ed2d8c7dda2e1cc93973fd6d437c80145de/vimeo-prod-skyfire-std-us/01/3195/19/490977203/2205504628.mp4?filename=Moon+-+59026.mp4"
        log('чётное')
    }
    else {
        link = "https://vod-progressive.akamaized.net/exp=1643991025~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F3353%2F25%2F641767435%2F2942139256.mp4~hmac=f4f47477cba6174909c8f02be6a40fa8811437669460e1e593d300a8e33004bd/vimeo-prod-skyfire-std-us/01/3353/25/641767435/2942139256.mp4?filename=Ocean+-+93745.mp4"
        log('нечётное')
    }
    
    create_display(link)
    myVideoTexture.play()
}


var myVideoClip: VideoClip
var myVideoTexture: VideoTexture
var myMaterial: Material
var screen: Entity

let video_scale = new Vector3(8, 4.5, 1)
let video_position = new Vector3(15, 1 + video_scale.y / 2, 4 + video_scale.x / 2)
let video_rotation = new Quaternion(0, 1, 0, 1)


myMaterial = new Material()
myMaterial.roughness = 1
myMaterial.specularIntensity = 0
myMaterial.metallic = 0

screen = new Entity()
screen.addComponent(new PlaneShape())
screen.addComponent(
    new Transform({
        position: video_position,
        scale: video_scale,
        rotation: video_rotation,
    })
)
screen.addComponent(myMaterial) 


let checker = new Entity()
engine.addEntity(checker)
checker.addComponent(
  new utils.Interval(1000, () => {
    var now = new Date();
    if (now.getSeconds() == 0) {
        executeTask(async () => {
           await get_data(now.getMinutes())
        })
        log('new minute')
    }
    log(now)
  })
)
engine.addEntity(screen)
